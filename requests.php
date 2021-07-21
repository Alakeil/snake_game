<?php
	$server = '192.168.1.5';
	$port = '3306';
	$username = 'root';
	$password = '';
	$dbname = 'snake_game';

	$dsn = "mysql:hostname=$server;dbname=$dbname;port=$port;charset=utf8mb4;";

	$options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new pdo($dsn, $username, $password, $options);
    } catch (\PDOException $e) {
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }

    // Respond to requests
	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		if (isset($_POST["name"]) && isset($_POST["score"])) {
			$name = $_POST["name"];
			$score = $_POST["score"];

			$sql = "INSERT INTO scoretable (name, score) VALUES (?, ?)";

			$query = $pdo->prepare($sql);

			$query->execute([$name, $score]);

			http_response_code(200);
		} else {
			http_response_code(400);		
		}
	} else if ($_SERVER["REQUEST_METHOD"] === "GET") {
		if (isset($_GET["type"])) {
			if ($_GET["type"] === "getHiScores") {
				// Fetch all records from the database ordered by score, and then select the top 10
				$sql = "SELECT * FROM scoretable ORDER BY score";

				$query = $pdo->prepare($sql);

				$query->execute();

				$hiScoreArray = array();

				// Pass them into an array
				for ($i = 0; $i < 5; $i++) {
					$player = $query->fetch();

					$hiScoreArray[$i] = array(
						"name" => htmlspecialchars($player["name"]),
						"score" => $player["score"]
					);
				}

				$jsonData = json_encode($hiScoreArray, JSON_PRETTY_PRINT);	

				header('Content-Type: application/json');

				echo $jsonData;
			}
		}
	}
?>