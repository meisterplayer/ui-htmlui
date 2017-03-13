/** @module CustomUi */
import { extractEventNodes, createRegisterDataEvents } from './lib/event-node-functions';
import { extractStandardNodes, createLoadStandardElement } from './lib/standard-node-functions';

/**
 * Plugin that can be used to supply your own HTMLElements that make up the ui. By specifying
 * data-attributes you can customize the functionality of the ui.
 * @memberof module:CustomUi
 */
class CustomUi extends Meister.Ui {
    /**
     * Create a new CustomUi.
     * @memberof module:CustomUi
     * @param {Object} config Configuration for the plugin.
     * @param {Meister} meister Meister instance which is instantiating a new CustomUi.
     */
    constructor(config, meister) {
        super(config, meister);

        if (this.meister.utils.isDOMNode(this.config.ui)) {
            this.element = this.config.ui;
            this.processTemplate();
        } else {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.config.ui);
            xhr.responseType = 'document';
            xhr.addEventListener('load', this.onTemplateRequestSuccess.bind(this), false);
            xhr.addEventListener('error', this.onTemplateRequestError.bind(this), false);
            xhr.send();
        }
    }

    /**
     * Name of the plugin that is used for registering it.
     * @return {String}
     */
    static get pluginName() {
        return 'CustomUi';
    }

    /**
     * Check the response status, and on a succes extract the first node to use as the custom ui.
     * @param {ProgressEvent} loadEvent Event object from the XMLHttpRequest.
     */
    onTemplateRequestSuccess(loadEvent) {
        if (loadEvent.target.status < 200 || loadEvent.target.status >= 400) {
            this.onTemplateRequestError(loadEvent);
            return;
        }

        this.element = loadEvent.target.response.activeElement.firstChild;
        this.processTemplate();
        // Force a redraw of the ui.
        this.draw();
    }

    /**
     * Log the XMLHttpRequest to the console.
     * @param {ProgressEvent} loadEvent Event object from the XMLHttpRequest.
     */
    onTemplateRequestError(loadEvent) {
        console.error('CustomUi : error loading the template:', loadEvent.target);
    }

    /**
     * Replace marked nodes with their StandardUi equivalents, and register events on the specified nodes.
     */
    processTemplate() {
        extractStandardNodes(this.element).forEach(createLoadStandardElement(this.meister, this.config.standard || {}));
        extractEventNodes(this.element).forEach(createRegisterDataEvents(this.meister, this.config.registeredCallback));
    }

    /**
     * Insert the Ui into the DOM.
     */
    draw() {
        if (!this.element) { return; }

        this.controlsWrapper.appendChild(this.element);
        this.meister.trigger('customUiReady');
    }
}

Meister.registerPlugin(CustomUi.pluginName, CustomUi);
export default CustomUi;
