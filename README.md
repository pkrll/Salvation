### Salvation
Work in progress.

#### Usage
* Create the form and add the validation rules (a complete list of attributes will be added as project progresses.
```html
<form id="form">
    <p><input type="text" required="required"></p>
    <p><input type="password" required="required"></p>
    <p><input type="text" data-format="numeric"></p>
    <p><input type="text" data-format="alphanumeric" data-length="1,5"></p>
    <p><input type="text" data-length="5"></p>
    <p><input type="submit" /></p>
</form>

```
* Add the following to the bottom of the page.
```js
<script type="text/javascript">
(function() {

     var salvation = new Salvation({
         element: document.getElementById("form")
     });

})();
</script>
```
#### Author
Ardalan Samimi
