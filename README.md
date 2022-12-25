# examples

![Example 1](media/image1.png)
![Example 2](media/image2.png)
![Example 3](media/image3.png)
![Example 4](media/image4.png)

> Generate svg captcha in node.js and randomly color the svg per key stroke including backspace or delete.
> Results in better user-experience and better captcha acceptance at the server.
> Uses crypto modules instead of Math.random for better randomness.

# motivation

[svg-captcha](https://github.com/produck/svg-captcha) is an excellent package that is recommended by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#take-precautions-against-brute-forcing) 
as part of protecting a web server against brute forcing. We started with a fork of svg-captcha and improved in two respects.

1. We noticed that svg-captcha uses Math.random. It is theoretically possible for an actor 
with distributed resources to learn to predict the outcome of Math.random which would defeat 
the purpose of having a captcha in a form. So, we replaced Math.random with functions from the crypto module.

2. We noticed that svg-captcha generates a complete svg including colors and sends it as a string to the browser. Instead, 
in our module, we send the paths that svg-captcha generates as a JSON array and generate a svg with random colors for the paths and background 
per key stroke including backspace and delete. The idea is that some combination of background and foreground colors would 
make the text more readable and thus would result in a better user experience. An end-user can press any character 
and erase it with backspace or delete any number of times until they can read the captcha clearly and then enter it.
Thus, it minimizes the chance of human users submitting incorrect results to the server. By the same token, when you 
receice too many errors from the same client at the server, it may not be a human submitting the captcha texts.

## install

NOTE: The following github package will be installed from npm.pkg.github.com registry. So, there should not be a leading @ while installing. 
However, the package will be installed in node_modules/@eskns/color-changing-svg-captcha. 
So, while importing it you should use a leading @. Please see below. 

```
npm install eskns/color-changing-svg-captcha
```

## usage

### Server-side with express
```Javascript
const svgCaptcha = require('@eskns/color-changing-svg-captcha');

app.get('/getCaptcha', function (req, res) {
	const {text, data} = svgCaptcha.create();
	req.session.captcha = text;
	// data is an object with keys width, height and paths	
    res.json(data);
});

app.post('/postCaptcha', function(req, res) {
	//handle post request
})
```
### Client-side with reactjs

The code below shows how to render the svg using the width, height and paths obtained from the server with random colors.
You need to use a form with a textbox for end-user to enter the captcha. Inside the form render the below svg component above the textbox.
Store the user input in a useState variable in the form and update the variable using the onChange event handler for the textbox.
This will cause the form to re-render itself and in that process it will re-render the svg. You could also store the svg component 
in a variable in the onChange event handler of the textbox and use that variable to re-render it in the form. 
For a working example, click on 'Sign In' at [eskns.com](https://eskns.com) and enter some text in the 'Captcha Code' textbox.

A full-fledged client implementation is coming soon.

``` Javascript
import React from 'react';
import tw from '@eskns/styledwindcss';
import styled from '@emotion/styled';

function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
}

function getRGB (len = 3) {
  var arr = new Uint8Array(len)
  window.crypto.getRandomValues(arr)
  return `#${Array.from(arr).map(dec2hex).join('')}`;
}

const Svg = tw`inline hover:shadow focus:shadow active:shadow-md

 ${styled.svg`
  grid-row-start: ${props => props.row_start || "auto"};
  grid-column: ${props => props.cols || "1 / -1"};
`}
`;

export default function ShowSvg(props) {

  const { height, width, paths } = props;
  const vb = `0 0 ${width} ${height}`;

  const svgPaths = paths.map(({d, fill}) => {
    if(fill != "none") {
      fill = getRGB();
    }
    return <path d={d} strokeWidth="1" fill={fill} stroke={getRGB()}/>
  });

  const fill = getRGB();

  return (<Svg viewBox={vb} height={height} width={width}
    onClick={props.handleClick} preserveAspectRatio="xMinYMin meet" >
    <React.Fragment>
    <rect width="100%" height="100%" fill={fill}/>
    {svgPaths}
    </React.Fragment>
    </Svg> )
}

```

The above code uses tailwindcss and @emotion/styled components to handle CSS in JavaScript. It uses our [styledwindcss](https://github.com/eskns/styledwindcss)
module that allows you to use both tailwindcss and @emotion/styled for styling the same React component. Please read [Max Stoiber](https://mxstbr.com/thoughts/tailwind) to understand why you may want to do that.

## API

The API on the serverside is the same as the original svg-captcha. Some of the parameters like color and background are not used. 

The original svg-captcha functions return an object with keys text and data both of which are of type string. In our case, the data
we return is an object with keys width, height and paths.

## License
[BSD-Clause-3](LICENSE.md)
