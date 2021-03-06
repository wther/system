<?php

/*
 * The MIT License
 *
 * Copyright 2014 Barnabas.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

require_once('php/db.php');

// Read URL
$query = isset($_GET['q']) ? $_GET['q'] : '';
$args = explode('/', $query);

$system = $args[0];

try {

    // If this was a POST request
    if (count($_POST) > 0) {

        // Verify authentication token
        $auth_token = $_POST['auth_token'];
        if (md5($auth_token) != $AUTH_TOKEN) {
            throw new Exception("Unauthorized, illegal authorization token:" . $auth_token);
        }

        $author = real_escape_string($_POST['author']);
        $system_id = real_escape_string($system);
        $content = real_escape_string($_POST['content']);

        query("INSERT INTO system_revisions (system_id, author, date, content) VALUES ('$system_id', '$author', NOW(), '$content')");

        // If this was a GET request
    } else {
        $command = isset($args[1]) ? $args[1] : '';
        $system_id = real_escape_string($system);
        
        // Unknown resource is assumed to be a system id            
        $where = 'TRUE';
        if (isset($args[1]) && $args[1] != 'latest') {
            $where = '`date` = DATE("' . real_escape_string($args[1]) . '")';
        }

        $result = query("SELECT `revision_id`, `system_id`, `author`, `date`, `content` FROM `system_revisions` WHERE $where AND `system_id`='$system_id' ORDER BY `date` DESC LIMIT 1");
        if ($result->num_rows == null) {
            throw new Exception("System not found!");
        }

        $row = $result->fetch_assoc();
        $rows = array();
        $rows['latest'] = $row;
        $rows['revisions'] = array();
        
        
        // We want to select all in ascending order
        // We dont want to select more than 1 over a five day period,
        // but from every five day period we want to select the most recent        
        $query = "SELECT `revision_id`, `system_id`, `author`, `date`, `content` FROM `system_revisions` "
                        . " WHERE `system_id`='$system_id' AND `date` IN " .
                
                        "(SELECT MAX(`date`) FROM `system_revisions`"
                        . " WHERE `system_id`='$system_id' " . ""
                        . " GROUP BY(UNIX_TIMESTAMP(`date`) DIV (5*24*3600)) ORDER BY `date` ASC)";
        
        $result = query($query);
        
        while($row = $result->fetch_assoc()){
            $rows['revisions'][] = $row;
        }

        header('HTTP/1.1 200 OK');
        header('Content-type: application/json');
        print json_encode($rows);
    }
} catch (Exception $e) {
    header('HTTP/1.1 200 Internal Server Error');
    header('Content-type: application/json');
    print json_encode(array(
        'errorMessage' => $e->getMessage()
    ));
}
?>