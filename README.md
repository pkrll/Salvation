### Salvation
A lightweight, easy to use form validation tool, written entirely in JavaScript and with no library dependencies. Also, a work in progress.

### Usage
Using Salvation is easy and requires very little effort to take advantage of the built-in validation rules. Below follows a quick start guide:
* Create the form and add the validation type (the attribute data-validate):
```html
<form id="form">
    <p><input type="text" name="username" data-validate="required"></p>
    <p><input type="password" name="password" required="required"></p>
    <p><input type="text" name="income" data-validate="numeric" data-length="5" data-format="min"></p>
    <p><input type="text" name="some-other-field" data-validate="alphanumeric" data-length="1,5"></p>
    <p><input type="text" name="date" data-validate="date" data-format="YY/MM/DD"></p>
    <p><input type="submit" /></p>
</form>
```
* Add the following to the bottom of the page.
```js
<script type="text/javascript">
     var salvation = new Salvation({
         element: document.getElementById("form")
     });
</script>
```
#### Options
##### Properties
```js
    new Salvation({
        element         :   document.getElementById("element"),
        dateFormat      :   "MM/DD/YYYY",
        datePlaceholder :   true
    });
```
* `element`: The form element to validate (**required**).
* `dateFormat`: The default validation rule for the date fields. This setting will be used if the attribute *data-format* is not set. If the `data-format` is set on one element, the default format will be overridden (`default: mm/dd/yyyy`).
* `datePlaceholder`: If set true, the date fields will display which date format they are set to (`default: true`).

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
   * `date`: The field must be a valid date, formatted as specified by the data-format attribute (or the default formatting rule). Salvation will check upon validation if the inputed date actually exists.
   * `length`: The field must have a certain length (see below).
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
