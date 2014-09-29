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
// Treat all date and time variables as UTC when using internal date manipulation
date_default_timezone_set("Europe/Budapest");

// Credentials for accessing the MySQL database
$db_config = array(
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'system'
);

$AUTH_TOKEN = '65b013e6d3cc63b103a48658861cb4dd';

/**
 * Attempts to connect to MySQL database
 */
function connect($db_config) {
    $db = new mysqli($db_config['host'], $db_config['username'], $db_config['password'], $db_config['database']);

    // Terminate if connecting was unsuccessful
    if ($db->connect_error) {
        throw new Exception("Failed to establish connection to $db_config[host], " . $db->connect_error);
    }

    return $db;
}

$db = connect($db_config);

/**
 * Execute query MySQL query
 */
function query($query) {
    global $db, $db_config;

    $result = $db->query($query);
    if (!$result) {
        throw new Exception($db->error);
    }

    return $result;
}

/**
 * Wrapper for the mysqli_real_escape_string function
 */
function real_escape_string($string) {
    global $db;
    return $db->real_escape_string($string);
}
