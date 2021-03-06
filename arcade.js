import Vue from "./node_modules/vue/dist/vue.esm.browser.min.js";

const LIST_PAGE = "list.html";
const IDLE_WARNING_TIMEOUT = 11 * 1000; // how long to display the idle warning
const IDLE_TIMEOUT = 60 * 1000;

const DEFAULT_BUTTON_TEXT = "MENU";
const WARNING_TEXT = "RETURNING TO MENU IN ";

let arcadeApp = new Vue({
    el: "#arcade-container",
    data: {
        buttonText: DEFAULT_BUTTON_TEXT,
        listPage: LIST_PAGE,
        url: LIST_PAGE, // url for the iframe
        onList: true, // are we on the list page?
        lastKeypressTime: performance.now(),
        showIdleWarning: false,
        hideButton: true,
    },
    methods: {
        toList: function(ev) {
            if (ev) {
                ev.preventDefault();
            }
            this.url = this.listPage;
            this.getIframeWindow().location = this.url;
        },
        frameLoad: function(ev) {
            this.url = this.getIframeWindow().location.href;
            this.injectUserActionEvents();

		console.log('FRAME LOADED: ',this.url);

            if (/fleshgod/i.test(this.url)) {
		    console.log('fleshgod');
                const fleshgodStyles = document.createElement('style');
                fleshgodStyles.rel = 'stylesheet';
                fleshgodStyles.innerHTML = 'html, body, canvas { height: 100%; margin: 0; padding: 0 } #canvas { margin: 0 auto; display: block; }';
                this.getIframeWindow().document.body.appendChild(fleshgodStyles);
            }
            else if (/Nuclear_Briefcase_HTML/i.test(this.url)) {
		    console.log('nuclear briefcase');
                const height = this.getIframeWindow().innerWidth;
                const fleshgodStyles = document.createElement('style');
                fleshgodStyles.rel = 'stylesheet';
                fleshgodStyles.innerHTML = `html, body { height: 100%; } #canvas { width: ${height}px }`;
                this.getIframeWindow().document.body.appendChild(fleshgodStyles);
            }
            else if (/1082033/i.test(this.url)) {
		    console.log('spam tower spam');
                // spam tower spam
                const height = this.getIframeWindow().innerHeight;
                const fleshgodStyles = document.createElement('style');
                fleshgodStyles.rel = 'stylesheet';
                fleshgodStyles.innerHTML = `html, body { height: 100%; } #canvas { height: ${height}px }`;
                this.getIframeWindow().document.body.appendChild(fleshgodStyles);
            }
            else if (/ransom/i.test(this.url)) {
		    console.log('ransom');
                const width = this.getIframeWindow().innerWidth;
                const fleshgodStyles = document.createElement('style');
                fleshgodStyles.rel = 'stylesheet';
                fleshgodStyles.innerHTML = `html, body { height: 100%; overflow: hidden; } canvas { width: ${width}px; }`;
                this.getIframeWindow().document.body.appendChild(fleshgodStyles);
            }
        },
        getIframeWindow: function() {
            return document.querySelector('.arcade-iframe').contentWindow;
        },
        updateIdle: function() {
            if (this.isIdle() && !this.onList) {
                const t = Math.floor(((IDLE_WARNING_TIMEOUT + IDLE_TIMEOUT) - this.idleFor())/1000);
                // const t = Math.floor((IDLE_WARNING_TIMEOUT - (IDLE_TIMEOUT - this.idleFor()))/1000);
                if (t < 1) {
                    console.log(`idle for ${t}s, going back to list page`);
                    this.hideButton = true;
                    this.toList();
                    return;
                }
                console.log(`idle countdown, going back to list page in ${t}s`);
                this.showIdleWarning = true;
                this.buttonText = WARNING_TEXT + t;
                this.hideButton = false;
            }
            else {
                this.hideButton = this.onList;
                this.buttonText = DEFAULT_BUTTON_TEXT;
            }
        },
        idleFor: function() {
            return performance.now() - this.lastKeypressTime;
        },
        isIdle: function() {
            return this.idleFor() > IDLE_TIMEOUT;
        },
        userAction: function() {
            this.lastKeypressTime = performance.now();
        },
        injectUserActionEvents: function() {
            this.getIframeWindow().addEventListener("keydown", this.userAction);
            this.getIframeWindow().addEventListener("mousemove", this.userAction);
            this.getIframeWindow().addEventListener("mousedown", this.userAction);
        }
    },
    watch: {
        url: function (url, oldUrl) {
            this.onList = url.indexOf(this.listPage) === url.length - this.listPage.length;
            this.hideButton = this.onList;

            console.log(`navigating to ${url}, onList? ${this.onList}`);
        },
    },
    mounted: function() {
        document.body.classList.add("ready");
    }
});

setInterval(arcadeApp.updateIdle, 1000);
