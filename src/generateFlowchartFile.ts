import { JSDOM } from "jsdom"

const { window } = <any>new JSDOM( `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  
</body>
</html>
` )
const { document } = window
global[ "window" ] = window
global[ "document" ] = document

import * as mermaid from "mermaid"

const theMermaid = <any>mermaid

export default function( codes: string, output: string ) {
  const container = document.createElement( "div" )
  container.innerHTML = `
graph LR
${ codes }
  `
  document.body.appendChild( container )

  // theMermaid.init( container )

  // console.log( container.innerHTML )

  // var insertSvg = function( svgCode ) {
  //   container.innerHTML = svgCode
  // }
}
