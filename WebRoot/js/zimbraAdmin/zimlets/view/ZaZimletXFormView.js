/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* This class describes a view of a single Zimlet
* @class ZaZimletXFormView
* @contructor
* @param parent {DwtComposite}
* @param app {ZaApp}
* @author Greg Solovyev
**/
ZaZimletXFormView = function(parent) {
	ZaTabView.call(this, parent,"ZaZimletXFormView");	
	this.initForm(ZaZimlet.myXModel,this.getMyXForm());
}

ZaZimletXFormView.prototype = new ZaTabView();
ZaZimletXFormView.prototype.constructor = ZaZimletXFormView;
ZaTabView.XFormModifiers["ZaZimletXFormView"] = new Array();
ZaZimletXFormView.TAB_INDEX=0;

/**
* Sets the object contained in the view
* @param entry - {ZaZimlet} object to display
**/
ZaZimletXFormView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		if(entry.attrs[a] instanceof Array) {
			this._containedObject.attrs[a] = new Array();
			for(var aa in entry.attrs[a]) {
				this._containedObject.attrs[a][aa] = entry.attrs[a][aa];
			}
		} else {
			this._containedObject.attrs[a] = entry.attrs[a];
		}
	}
	this._containedObject.name = entry.name;
	this._containedObject.type = entry.type ;
	if(entry.id)
		this._containedObject.id = entry.id;

    if(!entry[ZaModel.currentTab])
        this._containedObject[ZaModel.currentTab] = "1";
    else
        this._containedObject[ZaModel.currentTab] = entry[ZaModel.currentTab];

    this._localXForm.setInstance(this._containedObject) ;
    this.updateTab();
}
ZaZimletXFormView.myXFormModifier = function(xFormObject) {
    this.tabChoices = [] ;
    var cases = [] ;
    xFormObject.tableCssStyle="width:100%;";
	xFormObject.items = [
			{type:_GROUP_, cssClass:"ZmSelectedHeaderBg", colSpan: "*", id:"xform_header",
				items: [
					{type:_GROUP_,	numCols:4,colSizes:["90px","350px","100px","200px"],
                        items:[
                            {type:_OUTPUT_, ref:"name", label:ZaMsg.NAD_zimletName},
                            {type:_OUTPUT_, ref:ZaZimlet.A_zimbraZimletEnabled, label:ZaMsg.NAD_zimletStatus,choices:ZaModel.BOOLEAN_CHOICES },
                            {type:_OUTPUT_, ref:ZaZimlet.A_zimbraZimletDescription, label:ZaMsg.NAD_Description, colSpan: "*"}
                        ]
                    }
				],
				cssStyle:"padding-top:5px; padding-bottom:5px"
			},
			{type:_TAB_BAR_,  ref:ZaModel.currentTab,choices:this.tabChoices,cssClass:"ZaTabBar", id:"xform_tabbar"},
			{type:_SWITCH_, align:_LEFT_, valign:_TOP_, items:cases}
	];

};
ZaTabView.XFormModifiers["ZaZimletXFormView"].push(ZaZimletXFormView.myXFormModifier);