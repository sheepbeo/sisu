<?php    
require_once('SimpleImage.class.php');
error_reporting(E_ALL);
ini_set("display_errors", 0);

/*

  USAGE


    FILE SAVING
    send images as post, json string
    files:[
      {
        name:file name to be saved as,
        type:image/--filetype---,        
      }
    ],
    resize:[[128,128],[256,256]]....



    GET IMAGE
      .php?img=imagename&x=sizex&y=sizey




    GET LIST

      ?get=filelist

      &sort=name || time
      &limit=0....->
      &new=timestamp -- return newer than..
*/

$FOLDER = 'img';

function stamp($name,$size = null){
  global $FOLDER;

  if($size == null){
    return $FOLDER.'/ORIGIM.'.$name;
  } else if (is_array($size)){
    return $FOLDER.'/'.$size[0].'x'.$size[1].'.'.$name;
  } else {
    return $FOLDER.'/w.'.$size.'.'.$name;
  }
}

function isUrl($url){
  return true;
}

function saveImageFromUrl($url,$filename){
  global $FOLDER;
    if (isUrl($url) && $filename){
      $content = file_get_contents($url);
      file_put_contents($FOLDER.'/'.$filename, $content);
      return true;
    } else {
      return false;
    }
}

function getImage($name,$size,$mode='crop'){
     global $FOLDER;
      $img = new SimpleImage();
    
     if ($mode=='crop' && $size[0]<2000 && $size[0]>10 && $size[1]<2000 && $size[1] > 10){
       
       // if there is no requested size image available, then make one from original.
       if (!file_exists(stamp($name,$size))){                           
          if (file_exists(stamp($name))){
             $img->load(stamp($name));
             $img->crop($size[0],$size[1]);
             $img->save(stamp($name,$size));
          } else {            
            $img->setError($size);
          }
       } else {
          $img->load(stamp($name,$size));
       }       
       return $img;
     
     } else if ($mode == 'width' && is_numeric($size)){
       if (!file_exists($FOLDER.'/w.'.$size.'.'.$name)){            
          if (file_exists($FOLDER.'/ORIGIM.'.$name)){
             $img->load($FOLDER.'/ORIGIM.'.$name);             
             $img->resizeToWidth($size);
             $img->save($FOLDER.'/w.'.$size[1].'.'.$name);
          }
       } else {
          $img->load($FOLDER.'/w.'.$size[1].'.'.$name);
       }  
        return $img;
     } else {
        return false;
     }
}

// get an image at certain size
if (isset($_GET['img'])){ 
   $name = $_GET['img'];

   if (substr($name, -3) == 'gif'){
      $file = base64_encode( readfile($name) );
      echo $file;

   } else if (is_numeric($_GET['x']) && is_numeric($_GET['y'])){
     $size= array($_GET['x'],$_GET['y']);
     $img = getImage($name,Array($_GET['x'],$_GET['y']));
   }else if ($_GET['full']=='true'){
      $img = new SimpleImage();
      $img->load($FOLDER.'/ORIGIM.'.$name);      
   } else if(is_numeric($_GET['x'])){
      $img = getImage($name,$_GET['x'],'width');
   } else if (is_numeric($_GET['y'])){

   }
   if ($img){
    $img->output();
   }
}


if (isset($_POST['files'])){

	foreach ($_POST['files'] as $file) {
      $imagefile = base64_decode($file['data']);
      $name = $file['name'];

      $f = finfo_open();
      $type = finfo_buffer($f, $imagefile,FILEINFO_MIME_TYPE);

      if (substr($type,0,6) == 'image/'){

        if ($_POST['resize']){
           foreach ($_POST['resize'] as $size){
             $img = new SimpleImage();
             $img->setType($file['type']);
             $img->loadString($imagefile);            
             $img->crop($size[0],$size[1]);
             $img->save(stamp($name,$size));
           }
        }


        // save original image data
        /*
        $img->save(stamp($file['name']));
        $imgsize = Array($img->getWidth(),$img->getHeight());
        */

        // if there not was a thumbnail generated, then make it
        if (!file_exists($FOLDER.'/128x128.'.$file['name'])){
          $img = new SimpleImage();
          $img->setType($file['type']);
          $img->loadString($imagefile);
          $img->crop(128,128);
          $img->save($FOLDER.'/128x128.'.$file['name']);
        }
        file_put_contents(stamp($file['name']), $imagefile);
        
        echo json_encode(Array('ok'=>file_exists(stamp($name)),'size'=> $imgsize));
      
      } else {
        echo json_encode(Array('ok'=>'false','message'=>'not image file'));
      }
   }


}


function isImage($name){
  $is = false;
  if ($name != '.' && $name != '..'){
    $ext = substr($name,-4);
    
    if ($ext == '.png' || $ext == '.jpg' || $ext == '.gif' || $ext == 'jpeg'){
      $is = true;
    }
  }

  return $is;
}

function getList(){
    global $FOLDER;

    $handle = opendir($FOLDER);
    $result = Array();

    while (($file = readdir($handle)) != false){
      
      if (isImage($file)){

          $props = explode('.',$file);       
          $found = false;

          for ($i=0;$i<count($result);$i++){
            if ($result[$i]['name'] == $props[1].'.'.$props[2]){
                if ($props[0]!='ORIGIM'){
                  $result[$i]['size'][] = explode('x',$props[0]);
                }
                $found = true;
            }
          }      

          if (!$found){
            if ($props[0]!='ORIGIM'){
                $result[] = Array(
                  'name'=>$props[1].'.'.$props[2],
                  //'shortname'=>$props[1],
                  'size'=> Array(explode('x',$props[0])),
                  'type'=>$props[2],
                  'time'=>filemtime($file));
            } else {
               $result[] = Array(
                  'name'=>$props[1].'.'.$props[2],
                  //'shortname'=>$props[1],
                  'type'=>$props[2],
                  'time'=>filectime($file));
            }       
          }
       }
    }
    return $result;
}

function sortByTime($a,$b){
  return $a['time'] < $b['time'];
}

function sortyByName($a,$b){
 return strcmp($a['name'] , $b['name']); 
}



if ($_GET['get']=='filelist'){    
    
    $result = getList();

    if (is_numeric($_GET['new'])){
      $t_res = Array();
      foreach ($result as $item){
        if ($item['time']>$_GET['new']){
          $t_res[] = $item;
        }
      }
      $result = $t_res;
    }

    if ($_GET['sort']){
      $type = $_GET['sort'];

      switch ($type) {
        case 'time':
          usort($result, "sortByTime"); 
        break;
        case 'name':
          usort($result, "sortByName");
        break;
       }
    }

    if ($_GET['limit']){
      if (is_numeric($_GET['limit'])){
        $result = array_slice($result,0,$_GET['limit']);
      }
    }

    echo json_encode($result);
}



?>