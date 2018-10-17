import { observable, action } from "mobx";

class UIStore {
    constructor(rootStore) {
        this._rootStore = rootStore;
    }
    @observable dialogState = false;
    @observable dialogTitle = null;
    @observable dialogContent = null;
    
    @observable tooltipState = false;

    @observable arrowRef = null;
    
    @action
    closeDialog = () => {
        if (this.dialogState) {
            this.dialogState = false;
            this.dialogTitle = null;
            this.dialogContent = null;
        }
    }

    @action
    openDialog = () => {
        if (this.dialogState === false) {
            this.dialogState = true;
        }
    }

    @action
    setDialog = (title, content) => {
        this.dialogTitle = title;
        this.dialogContent = content;
    }

    @action
    openToolTip = () => {
        if (this.tooltipState) {
            this.tooltipState = false;
        }
    }

    @action
    closeToolTip = () => {
        if (this.tooltipState === false) {
            this.tooltipState = true;
        }
    }

    @action
    handleArrowRef = node => {
        this.arrowRef = node;
    }
}

export default UIStore;