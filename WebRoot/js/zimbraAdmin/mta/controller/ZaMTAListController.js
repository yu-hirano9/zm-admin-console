/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* @constructor
* @class ZaMTAListController
**/
function ZaMTAListController(appCtxt, container, app) {
	ZaController.call(this, appCtxt, container, app,"ZaMTAListController");
   	this._toolbarOperations = new Array();
   	this._popupOperations = new Array();			
	this.MTAPool = [];
	this._helpURL = "/zimbraAdmin/adminhelp/html/WebHelp/monitoring/monitoring_zimbra_mta_mail_queues.htm";					
}

ZaMTAListController.prototype = new ZaController();
ZaMTAListController.prototype.constructor = ZaMTAListController;

ZaController.initToolbarMethods["ZaMTAListController"] = new Array();
ZaController.initPopupMenuMethods["ZaMTAListController"] = new Array();

ZaMTAListController.prototype.show = 
function(list) {

    if (!this._UICreated) {
		this._createUI();
	} 	

	if (list != null) {
		this._contentView.set(list.getVector());
		//start loading queue info
		this.MTAPool = [];
		var tmpList = list.getArray();
		var numMTAs = tmpList.length;

		for(var ix = 0; ix < numMTAs; ix++) {
			this.MTAPool.push(tmpList[ix]);
		}
		
		var i=0;
		var tmp = [];
		var cnt = numMTAs > 5 ? 5 : numMTAs;
		for(i = 0; i < cnt; i++) {
			tmp[i] = this.MTAPool.shift();
		}
		ZaMTA._quecountsArr = new Array();
		for(i = cnt-1; i >= 0; i--) {
			tmp[i].load();
		}
	}	
	this._app.pushView(ZaZimbraAdmin._POSTQ_VIEW);			
	
	this._removeList = new Array();
	if (list != null)
		this._list = list;
		
	this._changeActionsState();		
}

ZaMTAListController.initToolbarMethod =
function () {
	//this._toolbarOperations.push(new ZaOperation(ZaOperation.LABEL, ZaMsg.TBB_LastUpdated, ZaMsg.TBB_LastUpdated_tt, null, null, null,null,null,null,"refreshTime"));	
//	this._toolbarOperations.push(new ZaOperation(ZaOperation.SEP));
	this._toolbarOperations.push(new ZaOperation(ZaOperation.REFRESH, ZaMsg.TBB_Refresh, ZaMsg.TBB_Refresh_tt, "Refresh", "Refresh", new AjxListener(this, this.refreshListener)));	
   	this._toolbarOperations.push(new ZaOperation(ZaOperation.VIEW, ZaMsg.TBB_View, ZaMsg.PQTBB_View_tt, "Properties", "PropertiesDis", new AjxListener(this, ZaMTAListController.prototype._viewButtonListener)));    		
	this._toolbarOperations.push(new ZaOperation(ZaOperation.NONE));
	this._toolbarOperations.push(new ZaOperation(ZaOperation.HELP, ZaMsg.TBB_Help, ZaMsg.TBB_Help_tt, "Help", "Help", new AjxListener(this, this._helpButtonListener)));				
   	
}
ZaController.initToolbarMethods["ZaMTAListController"].push(ZaMTAListController.initToolbarMethod);

ZaMTAListController.initPopupMenuMethod =
function () {
    this._popupOperations.push(new ZaOperation(ZaOperation.VIEW, ZaMsg.TBB_View, ZaMsg.PQTBB_View_tt, "Properties", "PropertiesDis", new AjxListener(this, ZaMTAListController.prototype._viewButtonListener)));
}
ZaController.initPopupMenuMethods["ZaMTAListController"].push(ZaMTAListController.initPopupMenuMethod);

ZaMTAListController.prototype._createUI = function () {
	try {
		var elements = new Object();
		this._contentView = new ZaMTAListView(this._container);
		this._initToolbar();
		if(this._toolbarOperations && this._toolbarOperations.length) {
			this._toolbar = new ZaToolBar(this._container, this._toolbarOperations); 
			elements[ZaAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		}
		this._initPopupMenu();
		if(this._popupOperations && this._popupOperations.length) {
			this._actionMenu =  new ZaPopupMenu(this._contentView, "ActionMenu", null, this._popupOperations);
		}
		elements[ZaAppViewMgr.C_APP_CONTENT] = this._contentView;
		this._app.createView(ZaZimbraAdmin._POSTQ_VIEW, elements);


		this._contentView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
		this._contentView.addActionListener(new AjxListener(this, this._listActionListener));			
		this._removeConfirmMessageDialog = new ZaMsgDialog(this._app.getAppCtxt().getShell(), null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);					
	
		
		this._UICreated = true;
	} catch (ex) {
		this._handleException(ex, "ZaMTAListController.prototype._createUI", null, false);
		return;
	}	
}

/**
* @return ZaItemList - the list currently displaid in the list view
**/
ZaMTAListController.prototype.getList = 
function() {
	return this._list;
}

/*
ZaMTAListController.prototype.refresh = 
function() {
	try {
		this._contentView.set(this._app.getServerList(true).getVector());
	} catch (ex) {
		this._handleException(ex, ZaMTAListController.prototype.refresh, null, false);
	}
}
*/

ZaMTAListController.prototype.set = 
function(serverList) {
	this.show(serverList);
}

/**
* This listener is called when the item in the list is double clicked. It call ZaMTAController.show method
* in order to display the MailQ View
**/
ZaMTAListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if(ev.item) {
			this._selectedItem = ev.item;
			this._app.getMTAController().show(ev.item);
		}
	} else {
		this._changeActionsState();	
	}
}

ZaMTAListController.prototype._listActionListener =
function (ev) {
	this._changeActionsState();
	this._actionMenu.popup(0, ev.docX, ev.docY);
}
/**
* This listener is called when the Edit button is clicked. 
* It call ZaMTAController.show method
* in order to display the MailQ View
**/
ZaMTAListController.prototype._viewButtonListener =
function(ev) {
	if(this._contentView.getSelectionCount() == 1) {
		var item = this._contentView.getSelection()[0];
		this._app.getMTAController().show(item);
	}
}


ZaMTAListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	if(cnt == 1) {
		var opsArray = [ZaOperation.EDIT];
		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [ZaOperation.EDIT];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);
	} else {
		var opsArray = [ZaOperation.EDIT];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}

/**
* @param ev
* This listener is invoked by ZaMTAController or any other controller that can change a ZaMTA object
**/
ZaMTAListController.prototype.handleMTAChange = 
function (ev) {
	//if any of the data that is currently visible has changed - update the view
	if(ev && this._contentView) {
		if(ev.getDetail("obj")) {
			this._contentView.setUI();
			//check if we have any MTAs in the queue waiting to be loaded
			if(this.MTAPool.length) {
				var mta = this.MTAPool.shift();
				mta.load();
			}
		}
	}
}

/**
* Asynchronously calls ZaItem.load {@link ZaItem#load}
**/
ZaMTAListController.prototype.getQCounts = function () {
	this.MTAPool = [];
	var tmpList = this._list.getArray();
	var numMTAs = tmpList.length;
	for(var ix = 0; ix < numMTAs; ix++) {
		this.MTAPool.push(tmpList[ix]);
	}
	var cnt = numMTAs > 5 ? 5 : numMTAs;
	var i=0;
	var tmp = [];
	for(i = 0; i < cnt; i++) {
		tmp[i] = this.MTAPool.shift();
	}
	ZaMTA._quecountsArr = new Array();
	for(i = cnt-1; i >= 0; i--) {
		tmp[i].load();
	}
}

ZaMTAListController.prototype.refreshListener = 
function () {
	this.getQCounts();
}

ZaMTAListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	if(cnt == 1) {
		var opsArray = [ZaOperation.VIEW];
		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [ZaOperation.VIEW];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);
	} else {
		var opsArray = [ZaOperation.VIEW];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}