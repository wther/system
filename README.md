BridgeView - Interactive Bridge Bidding System Editor
=====================================================

This project is an open-source HTML 5 based bridge bidding system editor. It uses Javascript and HTML 5 technologies to render content on the client side and a lightweight PHP side to persist the data.

How to setup?
-------------

Assuming that you have a LAMP stack, you would have to do the following things.

1. Check out the repository

        git clone https://github.com/wther/system
 
2. Create a MySQL database for the repository, e.g. *system*. Run these scripts to set up the schema:

        CREATE TABLE IF NOT EXISTS `system_revisions` (
            `revision_id` int(13) NOT NULL AUTO_INCREMENT,
            `system_id` varchar(255) CHARACTER SET utf8 NOT NULL,
            `author` varchar(255) CHARACTER SET utf8 NOT NULL,
            `date` datetime NOT NULL,
            `content` text CHARACTER SET utf8 NOT NULL,
            PRIMARY KEY (`revision_id`),
            KEY `system_id` (`system_id`,`date`)
        );
    
3. Create a user with permissions to the database.
    
4. Copy the public_html/php/config.example.php as public_html/php/config.php and replace the begining of the file with the previously created user's permission and the database access path. You may also want to set your own authentication token, so that even if people discover the location of you web service, they won't able to madle with your content. You may choose to hardcode this value in the editor.html or to ask people to enter it manually everytime.

        // Credentials for accessing the MySQL database
        $db_config = array(
            'host' => 'localhost',
            'username' => 'root',
            'password' => '',
            'database' => 'system'
        );
        
        // Authorization token set in the editor.html
        $AUTH_TOKEN = '65b013e6d3cc63b103a48658861cb4dd'; 

5. Finally setup Apache to direct to the *public_html* folder.

Do I have to use Apache and PHP?
--------------------------------

No, the web service part is only a few lines, you could easily implement it with any other server side technology.

Licenses and legal stuff?
------------------------

Free to use, change and sell. As you wish.