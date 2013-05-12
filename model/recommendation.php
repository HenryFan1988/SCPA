<?php
$pattern = $_POST['pattern'];

$world_url = "https://news.google.com/news/feeds?ned=au&topic=w&output=rss";
$business_url = "https://news.google.com/news/feeds?ned=au&topic=b&output=rss";
$local_url = "https://news.google.com/news/feeds?ned=au&topic=lo&output=rss";
$technique_url = "https://news.google.com/news/feeds?ned=au&topic=t&output=rss";
$sport_url = "https://news.google.com/news/feeds?ned=au&topic=s&output=rss";



$threshold = 10;
$totalScore = 0.0;

$namepatt = '/'.$pattern["name"].'/';
$urlpatt = '/'.$pattern["url"].'/';
$descriptionpatt = '/'.$pattern["description"].'/';
$topics = $_POST['topics'];


//var_dump($topics);
$news = array();

foreach($topics as $t)
{
      $range = intval($t["range"]);
	  if($range > 0)
	  { 
	      $xml = null;

		  switch($t["name"])
		  {
			  case "World": $xml = simplexml_load_file($world_url); break; 
			  case "Australia": $xml = simplexml_load_file($local_url); break;
			  case "Business": $xml = simplexml_load_file($business_url); break;
			  case "Technique": $xml = simplexml_load_file($technique_url); break;
			  case "Sport": $xml = simplexml_load_file($sport_url); break;
			  default:break;
		  }
		  
		  recommendNews($xml,$range);
		  
	  }
	  
}

$threshold = $totalScore/count($news);

function filter($items)
{
   global $threshold;
   $filtered_itemes = array();
   
   foreach($items as $i)
   {
      if($i->score >= $threshold)
      {
	     array_push($filtered_itemes,$i);
      }
   }
   
   return $filtered_itemes;
}
  
echo json_encode(filter($news));



function recommendNews($xml,$range)
{  
   global $news, $namepatt, $urlpatt, $descriptionpatt, $totalScore;

   foreach($xml->channel->item as $n)
   {
     $name_score =  preg_match_all($namepatt,(string)$n->title,$matches)? count($matches[0]) : 0;
    // echo (string)$n->title;
     //var_dump($matches[0]);
     $url_score =  preg_match_all($urlpatt,(string)$n->link,$matches)? count($matches[0]) : 0;
     $description = captureDescription((string)$n->description);
     $description_score =  preg_match_all($descriptionpatt,$description,$matches)? count($matches[0]) : 0;    
     $score = ($name_score + $url_score + $description_score * 0.2 + 0.5) * ($topic_score + 0.5);
     $totalScore += $score;
     
     $obj = new stdClass;
     $obj->title = (string)$n->title;
     $obj->link = (string)$n->link;
     $obj->description = $description;
     $obj->score = $score;
     

     array_push($news,$obj);
  }
}

function captureDescription($text){
  preg_match_all("/(?<=<\/b><\/font><br \/><font size=\"-1\">)([\s\S]+?)(?=<b>...<\/b><\/font>)/", $text, $matches);
  return $matches[0][0];
}
?>