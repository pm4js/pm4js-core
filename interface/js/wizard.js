function wizardApply() {
	wizardCallback();
	$('#wizardPopup').hide();
}

function wizardCancel() {
	$('#wizardPopup').hide();
}

$('#pm4jsWizardPopupClose').click(function(){
	$('#wizardPopup').hide();
});
