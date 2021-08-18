<?php 
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
require_once 'phpQuery/phpQuery/phpQuery.php';

function curl_get_html($url)
{
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	$result = curl_exec($curl);
    return $result;
}


function pq_get_data($url,
					 $key_to_arr,  
					 $names_col, 
					 $paths_elem, 
					 $purpose){
	$html = curl_get_html($url);
	$pq = phpQuery::newDocument($html);
	$data = [];
	$i = 0;
	foreach ($pq->find($key_to_arr) as $i=>$elem) {
		$pq_elem = pq($elem);
		$data[$i] =  [];
		foreach ($names_col as $j=>$name_col) {
			switch ($purpose[$j]){
				case 'text':
					$cell = $pq_elem->find($paths_elem[$j])->text();			
					break;
				case 'href':
					$cell = $url . str_replace("/procedure", '', $pq_elem->find($paths_elem[$j])->attr('href'));
					break;
			}
			$data[$i][$name_col] = str_replace(array("\r\n", "\n", "\r", "  "), '', $cell);
		}
	}
	phpQuery::unloadDocuments();
    return $data;
}


function fill_table($names_col, $parse_data, $db){
	$now_time = date("_d_m_y__H_i_s");
	$sql = 'CREATE TABLE load'.$now_time.' ( id INT AUTO_INCREMENT NOT NULL, ';
	foreach ($names_col as $i=>$name_col) {	
		$sql = $sql . $name_col . ' VARCHAR(255), ';
	}
	$sql = $sql . " PRIMARY KEY(id)); ";
	$query = mysqli_query($db, (string)$sql);
	if(!$query) return mysqli_error($db); 

	foreach ($parse_data as $i=>$row){
		$sql = 'INSERT INTO load'.$now_time.' ('.implode(", ", $names_col).')  VALUES (\'' . implode("', '", $row).'\');';
		$query = mysqli_query($db, (string)$sql);
		if(!$query) return mysqli_error($db); 
	}
	return 'Таблица load'.$now_time.' добавлена в базу данных | ';
}



if(isset($_POST)){
	$table_data = pq_get_data($_POST['url'],
							  $_POST['key_to_arr'],
							  $_POST['names_col'],
							  $_POST['paths_elem'],
							  $_POST['purpose']);
	
	if($_POST['host']){
		$host = $_POST['host'];
		$user = $_POST['username'];
		$password = $_POST['password'];
		$name_db =$_POST['db_name'];
		$connect = mysqli_connect($host, $user, $password, $name_db);
		if ($connect){
			$message = fill_table($_POST['names_col'], $table_data, $connect);
		} else {
			$message = 'К базе данных подключиться не удалось | ';
		}
	} else $message = '';
	$message = $message . "Всего: ".count($table_data)." записей";

	echo json_encode(['table_data' => $table_data, 'message' => $message]);
}

?>