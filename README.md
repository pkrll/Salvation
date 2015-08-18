## Salvation [![npm](https://img.shields.io/npm/v/salvation.svg)](https://www.npmjs.com/package/salvation) [![npm downloads](https://img.shields.io/npm/dm/salvation.svg)](https://www.npmjs.com/package/salvation) [![Bower](https://img.shields.io/bower/v/Salvation.svg)]() [![npm](https://img.shields.io/npm/l/salvation.svg)]()
A lightweight, easy-to-use form validation tool, written entirely in JavaScript and with no library dependencies. Also, a work in progress.

### Installation

##### Install with NPM

```bash
$ npm install salvation
```

##### Install with bower

```bash
$ bower install Salvation
```

### Usage
Using Salvation is easy and requires very little effort to take advantage of the built-in validation rules. Just create the form elements and declare the validation rules in the `data-validate` attribute, like so:
```html
<form id="form">
    <p><input type="text" name="username" data-validate="required"></p>
    <p><input type="password" name="password" data-validate="required, length" data-length="10" data-format="min"></p>
    <p><input type="text" name="email" data-validate="email"></p>
    <p><input type="text" name="birthday" data-validate="date" data-format="YY/MM/DD"></p>
    <p><input type="submit" /></p>
</form>
```
Add the following to the bottom of the page:
```js
<script type="text/javascript">
     var salvation = new Salvation({
         element: document.getElementById("form")
     });
     // You can also call the plugin like this:
     document.getElementById("form").addSalvation({
         // Options
     });
</script>
```
#### Options
Salvation is highly adjustable. You can override default settings by passing options to the plugin, as outlined below:
##### Properties
```js
    new Salvation({
        element         :   document.getElementById("element"),
        dateFormat      :   "MM/DD/YYYY",
        datePlaceholder :   true,
        onInvalidation  :   function (elements) { /* ... */ },
        onValidation    :   function (elements) { /* ... */ }
    });
```
* `element`: The form element to validate. This property is required *only* when initializing plugin with constructor pattern (new-keyword).
* `dateFormat`: Global formatting rule for date validation. This setting will be used if the local attribute `data-format` is not set on an element. If `data-format` is defined on one element, then the default format will be overridden on that individual element (`default: mm/dd/yyyy`).
* `datePlaceholder`: If true, the date fields will display the date format they are set to (`default: true`).
* `onInvalidation`: To override the default onInvalidation method, called when an element fails validation, define this property as a function. The method takes one parameter, which is an array containing the invalid form elements. The default method can be accessed by the user-overriden method with `this.defaultOnInvalidation()`).
* `onValidation`: To override the default onValidation method, called when an element that previously failed validation has been validated. Must also be defineed as a function. The method takes one parameter, which is an array containing the form elements that passed validation. The default method can be accessed by the user-overriden method with `this.defaultOnValidation()`).

##### Attributes
```html
    <input type="text" data-validate="required">
    <input type="text" data-validate="numeric, length" data-length="5" data-format="min">
    <input type="text" data-length="1,">
    <input type="text" data-validate="date" data-format="DD/MM/YYYY">
```
* `data-validate`: Sets the validation rule. Can have multiple values (i.e. `data-validate="required, numeric"`). The built-in rules are as follows:
   * `required`: The field can not be empty.
   * `numeric`: The field can only contain numbers.
   * `alphanumeric`: The field can only contain letters, numbers and underscore.
   * `date`: The field value must be a valid date, formatted as specified by the data-format attribute (or the default formatting rule). Salvation will check upon validation if the inputed date actually exists.
   * `email`: The field value must be a valid e-mail address.
   * `length`: The field value must have a certain length (see below).
   * You can also create your own rules by setting a custom value to `data-validate` and passing a custom regular expression when initializing the plugin (see below for an example).
* `data-length`: Specifies a minimum and/or maximum length, delimited by a comma. It is not required, although recommended, to be used with the `data-validate="length"` option.
   * Formatting:
      * `5`: A single digit will set the maximum length.
      * `5,`: A single digit, followed by a comma, sets the minimum length.
      * `5,10`: Two digits, delimited by a comma, sets minimum and maximum length.
* `data-format`: Formatting option for the date fields (i.e. `data-format="YY/MM/DD"`). This will override the default format. Can also be used to set the value of the length attribute to be either a maximum or minimum limit (`data-format="min/max"`). The `data-length` attribute must in that case only contain digits.

#### Customization
Salvation is also easily extendable and can take custom validation rules (as regular expressions). Below follows an example where we want to create a password field that requires at least one digit and a special character:
```html
    <form id="form">
        <input type="password" name="password" data-validate="custom-password">
    </form>

    <script type="text/javascript">
        var salvation = new Salvation({
            element: document.getElementById("form")
        }, {
            custom-password: /(?=.*[0-9])(?=.*[\W])/
            // The custom rules must be a regular expression
            // and have the same name as specified in the
            // form element.
        });
    </script>
```
#### Author
* Salvation was created by Ardalan Samimi.
