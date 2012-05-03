<?php
$page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
for ($i = 0, $j = 20; $i < $j; $i++)
{
    $no = $i + ($page)*20 + 1;
    $html.= "<div class=\"item item-$no\">.item-$no</div>";
}
$data = array(
    "result" => array(
        "last_id" => "123213213",
        "last_timestamp" => time(),
        "html" => $html,
        "count" => $no,
    )
);
echo json_encode($data);
?>
