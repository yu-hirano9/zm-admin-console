/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZaNewResourceXWizard (parent, app) {
	ZaXWizardDialog.call(this, parent, app, null, ZaMsg.NCD_NewResTitle, "550px", "300px","ZaNewResourceXWizard");
	this.accountStatusChoices = [
		{value:ZaResource.ACCOUNT_STATUS_ACTIVE, label:ZaResource.getAccountStatusLabel(ZaResource.ACCOUNT_STATUS_ACTIVE)}, 
		{value:ZaResource.ACCOUNT_STATUS_CLOSED, label:ZaResource.getAccountStatusLabel(ZaResource.ACCOUNT_STATUS_CLOSED)},
		{value:ZaResource.ACCOUNT_STATUS_LOCKED, label: ZaResource.getAccountStatusLabel(ZaResource.ACCOUNT_STATUS_LOCKED)},
		{value:ZaResource.ACCOUNT_STATUS_MAINTENANCE, label:ZaResource.getAccountStatusLabel(ZaResource.ACCOUNT_STATUS_MAINTENANCE)}
	];	
	
	this.resTypeChoices = [
		{value:ZaResource.RESOURCE_TYPE_LOCATION, label:ZaResource.getResTypeLabel ( ZaResource.RESOURCE_TYPE_LOCATION)}, 
		{value:ZaResource.RESOURCE_TYPE_EQUIPMENT, label:ZaResource.getResTypeLabel ( ZaResource.RESOURCE_TYPE_EQUIPMENT)}
	];	
	
	this.schedulePolicyChoices = [
		{value:ZaResource.SCHEDULE_POLICY_ACCEPT_UNLESS_BUSY, label:ZaResource.getSchedulePolicyLabel ( ZaResource.SCHEDULE_POLICY_ACCEPT_UNLESS_BUSY)},
		{value:ZaResource.SCHEDULE_POLICY_ACCEPT_ALL, label:ZaResource.getSchedulePolicyLabel ( ZaResource.SCHEDULE_POLICY_ACCEPT_ALL)}
	];
	
//	this.accountStatusChoices = [ZaResource.ACCOUNT_STATUS_ACTIVE, ZaResource.ACCOUNT_STATUS_MAINTENANCE, ZaResource.ACCOUNT_STATUS_LOCKED, ZaResource.ACCOUNT_STATUS_CLOSED];		
	this.stepChoices = [
		{label:ZaMsg.TABT_ResourceProperties, value:1},
		{label:ZaMsg.TABT_ResLocationContact, value:2}
	];
	
	this._lastStep = this.stepChoices.length;


	this.initForm(ZaResource.myXModel,this.getMyXForm());	
//    DBG.timePt(AjxDebug.PERF, "finished initForm");
   
	this._localXForm.setController(this._app);	
	this._localXForm.addListener(DwtEvent.XFORMS_FORM_DIRTY_CHANGE, new AjxListener(this, ZaNewResourceXWizard.prototype.handleXFormChange));
	this._localXForm.addListener(DwtEvent.XFORMS_VALUE_ERROR, new AjxListener(this, ZaNewResourceXWizard.prototype.handleXFormChange));	
	this._helpURL = ZaNewResourceXWizard.helpURL;
}


ZaNewResourceXWizard.prototype = new ZaXWizardDialog;
ZaNewResourceXWizard.prototype.constructor = ZaNewResourceXWizard;
ZaXDialog.XFormModifiers["ZaNewResourceXWizard"] = new Array();
ZaNewResourceXWizard.helpURL = "/zimbraAdmin/adminhelp/html/WebHelp/managing_accounts/create_an_account.htm";

//HC: Handles the Finish button's change
ZaNewResourceXWizard.prototype.handleXFormChange = 
function () {
	if(this._localXForm.hasErrors()) {
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	} else {
		if(this._containedObject.attrs[ZaResource.A_displayname] && this._containedObject[ZaResource.A_name].indexOf("@") > 0)
			this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
	}
}


/**
* Overwritten methods that control wizard's flow (open, go next,go previous, finish)
**/
ZaNewResourceXWizard.prototype.popup = 
function (loc) {
	ZaXWizardDialog.prototype.popup.call(this, loc);
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);	
}

ZaNewResourceXWizard.prototype.finishWizard = 
function() {
	try {		
		if(!ZaResource.checkValues(this._containedObject, this._app)) {
			return false;
		}
		var resource = ZaItem.create(this._containedObject, ZaResource, "ZaResource", this._app);
		if(resource != null) {
			//TODO: ?? if creation took place - fire an DomainChangeEvent
			this._app.getResourceController().fireCreationEvent(resource);
			this.popdown();		
		}
	} catch (ex) {
		this._app.getCurrentController()._handleException(ex, "ZaNewResourceXWizard.prototype.finishWizard", null, false);
	}
}

ZaNewResourceXWizard.prototype.goNext = 
function() {
	if (this._containedObject[ZaModel.currentStep] == 1) {
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);		
	} 
	
	this.goPage(this._containedObject[ZaModel.currentStep] + 1);
	if(this._containedObject[ZaModel.currentStep] == this._lastStep) {
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
	}	
}

ZaNewResourceXWizard.prototype.goPrev = 
function() {
	if (this._containedObject[ZaModel.currentStep] == 2) {
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
	}
	
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	
	this.goPage(this._containedObject[ZaModel.currentStep] - 1);
}

/**
* @method setObject sets the object contained in the view
* @param entry - ZaAccount object to display
**/
ZaNewResourceXWizard.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	this._containedObject.name = "";

	this._containedObject.id = null;
	if(ZaSettings.COSES_ENABLED) {
		var cosList = this._app.getCosList().getArray();
		for(var ix in cosList) {
			if(cosList[ix].name == "default") {
				this._containedObject.attrs[ZaResource.A_COSId] = cosList[ix].id;
				this._containedObject.cos = cosList[ix];
				break;
			}
		}
	
		if(!this._containedObject.cos) {
			this._containedObject.cos = cosList[0];
			this._containedObject.attrs[ZaResource.A_COSId] = cosList[0].id;
		}
	} else {
		this._containedObject.cos = new ZaCos(this._app);
	}
	//set the default value of resource type and schedule policy
	this._containedObject.attrs[ZaResource.A_zimbraCalResType] = ZaResource.RESOURCE_TYPE_LOCATION;
	this._containedObject[ZaResource.A_schedulePolicy] = ZaResource.SCHEDULE_POLICY_ACCEPT_UNLESS_BUSY;
	this._containedObject.attrs[ZaResource.A_accountStatus] = ZaResource.ACCOUNT_STATUS_ACTIVE;
	this._containedObject[ZaResource.A2_autodisplayname] = "TRUE";
	this._containedObject[ZaResource.A2_autoMailServer] = "TRUE";
	this._containedObject[ZaModel.currentStep] = 1;
	var domainName;
	
	if(ZaSettings.GLOBAL_CONFIG_ENABLED) {
		if(!domainName) {
			//find out what is the default domain
			domainName = this._app.getGlobalConfig().attrs[ZaGlobalConfig.A_zimbraDefaultDomainName];
			if(!domainName && ZaSettings.DOMAINS_ENABLED) {
				domainName = this._app.getDomainList().getArray()[0].name;
			}
		}
		this._containedObject.globalConfig = this._app.getGlobalConfig();
	} 
	if(!domainName) {
		domainName =  ZaSettings.myDomainName;
	}
	this._containedObject[ZaResource.A_name] = "@" + domainName;
	this._localXForm.setInstance(this._containedObject);
}

ZaNewResourceXWizard.onCOSChanged = 
function(value, event, form) {
	if(!ZaSettings.COSES_ENABLED)
		return;
		
	var cosList = form.getController().getCosList().getArray();
	var cnt = cosList.length;
	for(var i = 0; i < cnt; i++) {
		if(cosList[i].id == value) {
			form.getInstance().cos = cosList[i];
			break;
		}
	}
	this.setInstanceValue(value);
	return value;
}

ZaNewResourceXWizard.myXFormModifier = function(xFormObject) {	
	var domainName;
	if(ZaSettings.DOMAINS_ENABLED)
		domainName = this._app.getDomainList().getArray()[0].name;
	else 
		domainName = ZaSettings.myDomainName;

	var cases = new Array();
	
	var case1 = {type:_CASE_, numCols:1, relevant:"instance[ZaModel.currentStep] == 1", align:_LEFT_, valign:_TOP_};
	var case1Items = 
		[	{ref:ZaResource.A_displayname, type:_TEXTFIELD_, msgName:ZaMsg.NAD_ResourceName,label:ZaMsg.NAD_ResourceName, labelLocation:_LEFT_, width: "200px",
				elementChanged: function(elementValue,instanceValue, event) {
								//auto fill the account name when autodisplayname is true
								if(this.getInstance()[ZaResource.A2_autodisplayname]=="TRUE") {
									ZaResourceXFormView.generateAccountName(this.getInstance(), elementValue );
								}
								this.getForm().itemChanged(this, elementValue, event);
							}
		
			},			
			{ref:ZaResource.A_zimbraCalResType, type:_OSELECT1_, msgName:ZaMsg.NAD_ResType,label:ZaMsg.NAD_ResType, labelLocation:_LEFT_, choices:this.resTypeChoices},		
			{ref:ZaResource.A_name, type:_EMAILADDR_, msgName:ZaMsg.NAD_AccountName,label:ZaMsg.NAD_AccountName, labelLocation:_LEFT_,
				onChange: function(value, event, form) {
								//disable the autodisplayname whenever user does some action on the account name
								this.getInstance()[ZaResource.A2_autodisplayname] = "FALSE";						
								this.setInstanceValue(value);
							}
			}			
		];
	
	if(ZaSettings.COSES_ENABLED) {
		case1Items.push(
			{ref:ZaResource.A_COSId, type:_OSELECT1_, msgName:ZaMsg.NAD_ClassOfService,
				label:ZaMsg.NAD_ClassOfService, labelLocation:_LEFT_, 
				choices:this._app.getCosListChoices(), onChange:ZaNewResourceXWizard.onCOSChanged
			}
		);
	}
	case1Items.push({ref:ZaResource.A_accountStatus, type:_OSELECT1_, editable:false, msgName:ZaMsg.NAD_AccountStatus,label:ZaMsg.NAD_AccountStatus, labelLocation:_LEFT_, choices:this.accountStatusChoices});
	/*
	case1Items.push({ref:ZaResource.A_description, type:_INPUT_, msgName:ZaMsg.NAD_Description,label:ZaMsg.NAD_Description, labelLocation:_LEFT_, cssClass:"admin_xform_name_input"});
	*/
	//scheduling policy
	case1Items.push({ref:ZaResource.A_schedulePolicy, type:_OSELECT1_, msgName:ZaMsg.NAD_ResType,label:ZaMsg.NAD_SchedulePolicy, labelLocation:_LEFT_, width: "300px", choices:this.schedulePolicyChoices});	
	case1Items.push({ref:ZaResource.A_zimbraCalResAutoDeclineRecurring, type:_CHECKBOX_, msgName:ZaMsg.NAD_DeclineRecurring,label:ZaMsg.NAD_DeclineRecurring,relevantBehavior:_HIDE_, 
					labelCssClass:"xform_label", align:_LEFT_,labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE"});
					
	
	if(ZaSettings.SERVERS_ENABLED) {		
		case1Items.push({type:_GROUP_, numCols:3, nowrap:true, label:ZaMsg.NAD_MailServer, labelLocation:_LEFT_,
							items: [
								{ ref: ZaResource.A_mailHost, type: _OSELECT1_, label: null, editable:false, choices: this._app.getServerListChoices2(), 
									relevant:"instance[ZaResource.A2_autoMailServer]==\"FALSE\" && form.getController().getServerListChoices2().getChoices().values.length != 0",
									relevantBehavior:_DISABLE_
							  	},
								{ref:ZaResource.A2_autoMailServer, type:_CHECKBOX_, msgName:ZaMsg.NAD_Auto,label:ZaMsg.NAD_Auto,labelLocation:_RIGHT_,trueValue:"TRUE", falseValue:"FALSE"}
							]
						}); 
	}
	
	//Notes
	case1Items.push({ref:ZaResource.A_notes, type:_TEXTAREA_, msgName:ZaMsg.NAD_Notes,label:ZaMsg.NAD_Notes, labelLocation:_LEFT_});
	
	case1.items = case1Items;
	cases.push(case1);
		
	var case2={type:_CASE_, numCols:2, relevant:"instance[ZaModel.currentStep] == 2",colSizes:["150px","300px"],
					items: [
						{ref:ZaResource.A_zimbraCalResSite, type:_TEXTFIELD_, msgName:ZaMsg.NAD_Site,label:ZaMsg.NAD_Site, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_zimbraCalResBuilding, type:_TEXTFIELD_, msgName:ZaMsg.NAD_Building,label:ZaMsg.NAD_Building, labelLocation:_LEFT_, width:150},						
						{ref:ZaResource.A_zimbraCalResFloor, type:_TEXTFIELD_, msgName:ZaMsg.NAD_Floor,label:ZaMsg.NAD_Floor, labelLocation:_LEFT_, width:150},						
						{ref:ZaResource.A_zimbraCalResRoom, type:_TEXTFIELD_, msgName:ZaMsg.NAD_Room,label:ZaMsg.NAD_Room, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_locationDisplayName, type:_TEXTFIELD_, msgName:ZaMsg.NAD_LocationDisplayName,label:ZaMsg.NAD_LocationDisplayName, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_street, type:_TEXTFIELD_, msgName:ZaMsg.NAD_Street,label:ZaMsg.NAD_Street, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_city, type:_TEXTFIELD_, msgName:ZaMsg.NAD_city ,label:ZaMsg.NAD_city, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_state, type:_TEXTFIELD_, msgName:ZaMsg.NAD_state ,label:ZaMsg.NAD_state, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_country, type:_TEXTFIELD_, msgName:ZaMsg.country ,label:ZaMsg.NAD_country, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_zip, type:_TEXTFIELD_, msgName:ZaMsg.zip ,label:ZaMsg.NAD_zip, labelLocation:_LEFT_, width:150},
						{type:_SEPARATOR_, colSpan: "2"},
						{ref:ZaResource.A_zimbraCalResContactName, type:_TEXTFIELD_, msgName:ZaMsg.NAD_ContactName,label:ZaMsg.NAD_ContactName, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_zimbraCalResContactEmail, type:_TEXTFIELD_, msgName:ZaMsg.NAD_ContactEmail,label:ZaMsg.NAD_ContactEmail, labelLocation:_LEFT_, width:150},
						{ref:ZaResource.A_zimbraCalResContactPhone, type:_TEXTFIELD_, msgName:ZaMsg.NAD_ContactPhone,label:ZaMsg.NAD_ContactPhone, labelLocation:_LEFT_, width:150}
					]
				};
	cases.push(case2);

	xFormObject.items = [
			{type:_OUTPUT_, colSpan:2, align:_CENTER_, valign:_TOP_, ref:ZaModel.currentStep, choices:this.stepChoices},
			{type:_SEPARATOR_, align:_CENTER_, valign:_TOP_},
			{type:_SPACER_,  align:_CENTER_, valign:_TOP_},
			{type:_SWITCH_, width:450, align:_LEFT_, valign:_TOP_, items:cases}
		];
};
ZaXDialog.XFormModifiers["ZaNewResourceXWizard"].push(ZaNewResourceXWizard.myXFormModifier);