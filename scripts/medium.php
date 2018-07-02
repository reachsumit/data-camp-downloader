<?php
    $url = $_SERVER['QUERY_STRING'];
    $html_select = file_get_contents($url);
    echo $html_select;
?>