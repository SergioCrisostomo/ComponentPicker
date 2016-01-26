
# Component Picker

### A JavaScript/CSS component picker, with native JS and CSS transitions.



This can be used as datepicker, component picker or whatever you pass into it. It can me multiple or simple.  
Here you can see a [demo from this repository](https://rawgit.com/SergioCrisostomo/ComponentPicker/master/demo.html).

## Usage

    var picker = new ComponentPicker(element, dataArray);
	picker.onChange(function(value, i){
		console.log('I changed to ', value);
	});

### Arguments

    var picker = new ComponentPicker(element, <data array | range string>);

 - **element**, a element from the DOM where the picker will build its home
 - **data**, this can be a array with the text to be inserted, or a string with the formar of `2020-2030` so the picker will loop the numbers from `2020` to `2030`, inserting them as the content for the picker.


## Methods

 - **onChange**, this method accepts a _callback_ function receiving the _value_ and the _index_ of the new position.
 - **getValue**, to get the current displayed value.
 - **setValue**, to set the ComponentPicker value. If the value passed does not exist will ignore the action silently.


### TODO:

 - optional button for callback (like "done", or "set", in bottom)
 - maybe in the future the axis can be configurable, so it works in horizontal also.
 - separate COmponent Picker and Date Picker into modules with browserify
