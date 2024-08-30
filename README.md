# Render JS
A library that handles JS routing, state DOM updating, and injecting JS into HTML.

Live Demo: https://soniksarungale.com/renderJS/

## Basic Setup
```
<div id="root"></div>
<script src="renderJs.js"></script>
<script>
    const routings = {
        defaultPage: '/home',
        base_dir: "pages",
        route: {
            "/home": "home.html",
            "/aboutUs": "about.html"
        }
    };

    setDOM(
        document.getElementById("root"),
        routings
    );    
</script>
```
### `setDOM` Parameter Details
- **root**: Root element in which content will be rendered.
- **routings**:
  - **defaultPage**: Default URL for initial rendering.
  - **base_dir**: Directory in which all HTML pages are present.
  - **route**:
    - URL: HTML Page.

Example links:
```
<a href="/home" class="async-link">Home</a>
<a href="/aboutUs" class="async-link">About</a>
```
Add the class "async-link" to all anchor tags for asynchronous navigation.

## Injecting JS in HTML 

### Variable
```
<h1 data-render>{{title}}</h1>
<p data-render>{{message}}</p>
```
### Condition
```
<div data-render>
{{#if (showDate)}}
    <p>Date: {{date}}</p>
{{/if}}
</div>
```
### Loop
```
<ul data-render>
    {{#each items}}
      <li>{{name}}: {{value}}</li>
    {{/each}}
</ul>
```
### DataStore
You need to pass data as a JSON object in the `setData` function and specify the `data-render` attribute in each tag where you want to inject data.
```
<script>
dataStore.setData({
    title: 'Hello, World',
    message: 'Welcome to Render JS',
    showDate: true,
    date: new Date().toLocaleDateString(),
    items: [
        { name: 'Item 1', value: 'Value 1' },
        { name: 'Item 2', value: 'Value 2' },
        { name: 'Item 3', value: 'Value 3' }
    ]
});
</script>
```
## DOM Update
```
dataStore.update('title', 'Hello');
```
In `update`, the first parameter is the variable name and the second is the data. After calling `dataStore.update`, the UI component will refresh with the new value.
```
dataStore.get('title');
```
You can also use `dataStore.get` to get a variable value by passing the name.
