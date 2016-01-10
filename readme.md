
# PickerView

### A JavaScript/CSS component picker, with native JS and CSS transitions.



This can be used as datepicker, component picker or whatever you pass into it. It can me multiple or simple.  
Here you can see a [demo from this repository](https://rawgit.com/SergioCrisostomo/ComponentPicker/master/demo.html).

_This is under development. If its usefull for you you are welcome to contribute._

## Usage

    var picker = new PickerView(element, dataArray);
	picker.onChange(function(value, i){
		console.log('I changed to ', value);
	});


## Methods

 - **onChange**, this method accepts a callback function receiving the _value_ and the _index_ of the new position.
 - **value**, this method is a setter/getter. If used with no value it will work as a _getter_, if passed a value it will look for that value and _set_ it.


### TODO:

 - optional button for callback (like "done", or "set", in bottom)
 - maybe in the future the axis can be configurable, so it works in horizontal also.
