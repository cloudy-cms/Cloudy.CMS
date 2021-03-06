﻿import Blade from '../blade.js';
import Button from '../button.js';
import LinkButton from '../link-button.js';
import ContextMenu from '../ContextMenuSupport/context-menu.js';
import TabSystem from '../TabSupport/tab-system.js';
import notificationManager from '../NotificationSupport/notification-manager.js';
import FormBuilder from '../FormSupport/form-builder.js';
import fieldDescriptorProvider from '../FormSupport/field-descriptor-provider.js';
import fieldModelBuilder from '../FormSupport/field-model-builder.js';



/* EDIT CONTENT */

class EditContentBlade extends Blade {
    onCompleteCallbacks = [];

    constructor(app, contentType, content) {
        super();

        this.app = app;
        this.contentType = contentType;
        this.content = content;
        this.formId = `Cloudy.CMS.Content[type=${this.contentType.id}]`;

        this.element.addEventListener("keydown", (event) => {
            if ((String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) || event.which == 19) { // 19 for Mac:s "Command+S"
                if (this.saveButton) {
                    this.saveButton.triggerClick();
                }
                event.preventDefault();
            }
        });
    }

    async open() {
        this.fieldModels = await fieldModelBuilder.getFieldModels(this.formId);
        this.formBuilder = new FormBuilder(this.app, this);

        if (this.content.id) {
            var name = '';

            if (!this.contentType.isSingleton) {
                if (this.contentType.isNameable) {
                    name = this.contentType.nameablePropertyName ? this.content[this.contentType.nameablePropertyName] : this.content.name;
                }
            }
            if (!name) {
                name = this.contentType.name;
            }

            this.setTitle(`Edit ${name}`);
        } else {
            this.setTitle(`New ${this.contentType.name}`);
        }

        if (this.content.id && this.contentType.isRoutable) {
            var response;

            try {
                response = await fetch(`GetUrl/GetUrl?id=${encodeURIComponent(this.content.id)}&contentTypeId=${encodeURIComponent(this.content.contentTypeId)}`, {
                    credentials: 'include',
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    var text = await response.text();

                    if (text) {
                        throw new Error(text.split('\n')[0]);
                    } else {
                        text = response.statusText;
                    }

                    throw new Error(`${response.status} (${text})`);
                }

                var urls = await response.json();
            } catch (error) {
                notificationManager.addNotification(item => item.setText(`Could not get URL --- ${error.message}`));
                throw error;
            }

            if (!urls.length) {
                return;
            }

            this.setToolbar(new LinkButton('View', `${location.origin}/${urls[0]}`, '_blank').setInherit());
        }

        this.buildForm();
    }

    async buildForm() {
        try {
            var groups = [...new Set((await fieldDescriptorProvider.getFor(this.formId)).map(fieldDescriptor => fieldDescriptor.group))].sort();

            if (groups.length == 1) {
                var form = await this.formBuilder.build(this.content, this.fieldModels.filter(fieldModel => fieldModel.descriptor.group == groups[0]));
                
                this.setContent(form);
            } else {
                var tabSystem = new TabSystem();

                if (groups.indexOf(null) != -1) {
                    tabSystem.addTab('General', async () => {
                        var element = document.createElement('div');
                        var form = await this.formBuilder.build(this.content, this.fieldModels.filter(fieldModel => fieldModel.descriptor.group == null));
                        form.appendTo(element);
                        return element;
                    });
                }

                groups.filter(g => g != null).forEach(group => tabSystem.addTab(group, async () => {
                    var element = document.createElement('div');
                    var form = await this.formBuilder.build(this.content, this.fieldModels.filter(fieldModel => fieldModel.descriptor.group == group));
                    form.appendTo(element);
                    return element;
                }));

                this.setContent(tabSystem);
            }
        } catch (error) {
            notificationManager.addNotification(item => item.setText(`Could not build form --- ${error.message}`));
            throw error;
        }
    }

    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);

        return this;
    }
}

export default EditContentBlade;