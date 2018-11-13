<?php

require('compiler/vendor/autoload.php');

use EmberAddon\Compiler as Compiler;
$compiler = new Compiler();

$package = json_decode(file_get_contents('package.json'));
$name = $package->name;

$dirIterator = new RecursiveDirectoryIterator('addon');
$iterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

$files = [];

foreach ($iterator as $file) {

  if($file->isFile())
  {
   $ext = $file->getExtension();
   if($ext == 'js')
   {
    $path = $file->getPathName();
    $source = file_get_contents($file->getPathName()); 
    //normalize path
    $parts = explode('/', $path);
    array_shift($parts);
    array_unshift($parts, $name);
    $moduleId = implode('/', $parts);
    //remove file extension
    $moduleId = substr($moduleId, 0, -3);
    $files[$moduleId] = [
      'path'   => $file->getPathName(),
      'source' => $compiler->compileJs($path, $source, $moduleId, $name),
    ];
   }

   if($ext == 'hbs')
   {
    $path = $file->getPathName();
    $source = file_get_contents($file->getPathName()); 
    //normalize path
    $parts = explode('/', $path);
    array_shift($parts);
    array_unshift($parts, $name);
    $moduleId = implode('/', $parts);
    //remove file extension
    $moduleId = substr($moduleId, 0, -4);
    $files[$moduleId] = [
      'path'   => $file->getPathName().".js",
      'source' => $compiler->compileHbs($path, $source, $moduleId, $name),
    ];
   }

  }
}


foreach($files as $file){
  $parts = explode('/', $file['path']);
  $filename = array_pop($parts);
  array_shift($parts);
  array_unshift($parts, 'js');
  array_unshift($parts, 'dist');
  $path = implode('/', $parts);

  if(!file_exists($path))
    mkdir($path, 0777, true);

  file_put_contents("$path/$filename", $file['source']);
}
