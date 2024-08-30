const dataStore = {
    routeList : {},
    routeBase: null,
    root: null,
    data: {},
    originalHTML: null,
    currHTML: "",
    baseUrl: "",
    appendedScripts: [],
    renderList: [],
    setData: function(newData) {
        Object.assign(this.data, newData);
        this.updateParts();
    },
    get: function(varname){
        return this.data[varname];
    },
    storeRenderList: function(){
        this.renderList = [];
        this.root.querySelectorAll('[data-render]').forEach(element => {
            this.renderList.push({"elm": element,"rawHTML":element.innerHTML});
        });
    },
    removeAppendedTempScripts: function() {
        this.appendedScripts.forEach(script => script.remove());
        this.appendedScripts.length = 0;
    },
    executeScript: function() {
        this.removeAppendedTempScripts();
        const scripts = root.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            const scriptFunction = new Function(newScript.textContent);
            scriptFunction();
            document.body.appendChild(newScript);
            this.appendedScripts.push(newScript);
        });
    },
    evaluateCondition: function(condition) {
        Object.keys(this.data).forEach(key => {
          let value = this.data[key];
          condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(value));
        });
        try {
          return eval(condition);
        } catch (e) {
          console.error('Condition evaluation error:', e);
          return false;
        }
    },
    update: function(varname, varval){
        this.data[varname] = varval;
        this.updateParts();
    },
    updateParts: function() {
        const variablePattern = /{{\s*(\w+)\s*}}/g;
        const ifPattern = /{{#if\s+\((.*?)\)}}([\s\S]*?){{\/if}}/g;
        const eachPattern = /{{#each\s+(\w+)\s*}}([\s\S]*?){{\/each}}/g;

        this.renderList.forEach(element => {
            let contentBox = element.rawHTML;
            contentBox = contentBox.replace(eachPattern, (match, array, loopContent) => {
                if (!Array.isArray(this.data[array])) {
                    return '';
                }
                return this.data[array].map(item => {
                    return loopContent.replace(/{{\s*(\w+)\s*}}/g, (match, variable) => {
                        return item[variable] !== undefined ? item[variable] : '';
                    });
                }).join('');
            });
            
            contentBox = contentBox.replace(ifPattern, (match, condition, ifContent) => {
                let result = this.evaluateCondition(condition);
                return result ? ifContent : '';
            });
        
            contentBox = contentBox.replace(variablePattern, (match, variable) => {
                return this.data[variable] !== undefined ? this.data[variable] : '';
            });
            element.elm.innerHTML = contentBox;
        });
    },
    renderHTML: function() {
        if (this.root) {
            this.root.innerHTML = this.currHTML;
        }
    },
    setRoutes: function() {
        const tempRoutesList = {};
        document.querySelectorAll('.async-link').forEach((elm) => {
            if(elm.hasAttribute('page-target')){
                tempRoutesList[elm.getAttribute('href')] = elm.getAttribute('page-target');
            }
        });

        this.routeList = {...this.routeList, ...Object.entries(tempRoutesList).map(([key, value]) => ({ [key]: value }))};
    },
}
const renderPage = (page) => {
    return fetch(`${dataStore.routeBase}/${page}`)
        .then(response => response.text())
        .then(html => {
            dataStore.currHTML = html;
            dataStore.renderHTML(); 
            dataStore.storeRenderList();
            dataStore.executeScript();
            dataStore.setRoutes(); 
        })
        .catch(error => console.error('Error fetching data:', error));
}

const loadPage = (url) => {
    window.history.pushState('', '', `${dataStore.baseUrl}#${url}`);
    let page = dataStore.routeList[url];
    if (!dataStore.routeList.hasOwnProperty(url)) page = `${url}.html`;
    return renderPage(page);
}

const getBaseUrl = () => {
    return window.location.pathname;
}

const setDOM = (root, routings) => {
    const defaultPage = routings.defaultPage;
    dataStore.root = root;
    dataStore.routeBase = routings.base_dir;
    dataStore.routeList = routings.route || [];
    dataStore.baseUrl = getBaseUrl();
    return loadPage(defaultPage).then(() => {
        dataStore.setRoutes();
    });
}
document.body.addEventListener('click', function(event) {
    if (event.target.matches('a.async-link')) {
        event.preventDefault();
        const url = event.target.getAttribute('href');
        loadPage(url);
    }
});
function removeAllScriptsFromBody() {
    const scripts = document.body.querySelectorAll('script');
    scripts.forEach(script => script.remove());
}