function SelectText(node)
{
	node = document.getElementById(node);

	if (document.body.createTextRange)
	{
		const range = document.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	}
	else if (window.getSelection)
	{
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(node);
		selection.removeAllRanges();
		selection.addRange(range);
	}
	else
	{
		console.warn("Could not select text in node: Unsupported browser.");
	}
}
function CopyToClipboard(str)
{
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}
function CheckboxSetting(settingName, onChange)
{
	var ele_checkbox = document.getElementById(settingName);
	ele_checkbox.addEventListener("change", function (e)
	{
		var obj = {};
		obj[settingName] = e.target.checked;
		chrome.storage.sync.set(obj);
		if (typeof onChange === "function")
			onChange();
	});
	chrome.storage.sync.get([settingName], function (result)
	{
		ele_checkbox.checked = result[settingName];
	});
	this.get = function ()
	{
		return ele_checkbox.checked;
	}
	this.set = function (value)
	{
		ele_checkbox.checked = !!value;
	}
}

// Perform setup activities
var ele_getLink = document.getElementById("getLink");
var ele_myLink = document.getElementById("myLink");
var ele_copied = document.getElementById("copied");

var copyAutomatically = new CheckboxSetting("copyAutomatically");
var useFullDomain = new CheckboxSetting("useFullDomain", produceShortLink);
var useHttps = new CheckboxSetting("useHttps", produceShortLink);

var lastUrl = null;

function produceShortLink()
{
	var m = lastUrl.match(/\/(?:dp|gp\/product)\/([^\/?#]+)/i);
	if (!m)
	{
		console.log("Unexpected product URL format", lastUrl);
		ele_myLink.innerText = "URL not recognized as an Amazon product.";
		ele_getLink.style.display = "none";
		return;
	}
	var asin = m[1];
	var domain = "amzn.com";
	if (useFullDomain.get())
		domain = "amazon.com";
	var link = "http" + (useHttps.get() ? "s" : "") + "://" + domain + "/dp/" + asin;
	var doCopy = function ()
	{
		CopyToClipboard(link);
		ele_copied.style.display = "inline";
	};
	ele_getLink.addEventListener("click", doCopy);

	ele_myLink.innerText = link;
	SelectText("myLink");

	if (copyAutomatically.get())
		doCopy();

	document.getElementById("qrcode").innerHTML = "";
	var qrcode = new QRCode(document.getElementById("qrcode"), {
		text: link,
		width: 200,
		height: 200,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
}

chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs)
{
	lastUrl = tabs[0].url;
	produceShortLink();
});