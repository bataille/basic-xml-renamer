/**
 * @file A tool to change the "libelle" field of some objects in a BASIC XML
 * file according to a list of actions loaded from a csv file.
 * @author Benoit Bataille <benoit.bataille@talan.com>
 * @version 1.0.0
 */

/* Global variables */

var xmlDoc; // the processed XML Document
var renameActionsArray; // An array containing the renaming to do
var saveFileName = ""; // The name of the resulting file

/* DOM Manipulation */

/**
 * Add a new row to the renameActionsTable from an arry representing a
 * renameAction.
 *
 * @param {Array.<string, string, string>} renameActionArray An array 
 * reprensenting rename action as [GUID, oldName, newName]
 * @param {int} actionIndex the position of the renameActionArray in the list
 * of all actions
 */
function insertRenameAction(renameActionArray, actionIndex) {
    var table = document.getElementById("renameActionsTable");
    var row = table.insertRow(-1); // Insert last

    var cellNb = row.insertCell(0);
    var cellGUID = row.insertCell(1);
    var cellOldName = row.insertCell(2);
    var cellNewName = row.insertCell(3);
    row.insertCell(4); // Status

    cellNb.innerHTML = actionIndex + 1; // Start numbering at 1 rather than 0
    cellGUID.innerHTML = renameActionArray[0];
    cellOldName.innerHTML = renameActionArray[1];
    cellNewName.innerHTML = renameActionArray[2];
}

/**
 * Put a green checkmark in the status column of the actions table
 *
 * @param {int} actionIndex the index of the successful action in the
 * action arrays (increment by 1 for corresponding row)
 */
function markRowAsSuccess(actionIndex) {
    var actionsTable = document.getElementById("renameActionsTable");
    actionsTable.rows[actionIndex + 1].cells[4].innerHTML = "✓";
    actionsTable.rows[actionIndex + 1].cells[4].classList.add("text-success");
}

/**
 * Put an exclamation mark in the status column of the actions table and turns
 * the row orange
 *
 * @param {int} actionIndex the index of the successful action in the
 * action arrays (increment by 1 for corresponding row)
 */
function markRowAsWarning(actionIndex) {
    var actionsTable = document.getElementById("renameActionsTable");
    actionsTable.rows[actionIndex + 1].cells[4].innerHTML = "!";
    actionsTable.rows[actionIndex + 1].classList.add("bg-warning");
}

/**
 * Put an "x" in the status column of the actions table and turns the row red
 *
 * @param {int} actionIndex the index of the successful action in the
 * action arrays (increment by 1 for corresponding row)
 */

function markRowAsFailure(actionIndex) {
    var actionsTable = document.getElementById("renameActionsTable");
    actionsTable.rows[actionIndex + 1].cells[4].innerHTML = "✕";
    actionsTable.rows[actionIndex + 1].classList.add("bg-danger");
    actionsTable.rows[actionIndex + 1].classList.add("text-light");
}

/**
 * Insert an array of array representing rename action (result of csv parsing) 
 * into the renameActionsTable
 *
 * @param {Array.<Array.<string, string, string>>} csvArray An array of array
 * reprensenting rename action as [GUID, oldName, newName]
 */
function displayCsvArray(csvArray) {
    csvArray.forEach(insertRenameAction);
}

/**
 * Add a success label to a card header 
 *
 * @param {string} headerId the id of the header to modify
 * @param {string} labelContent the content of the label
 */
function addSuccessLabelToHeader(headerId, labelContent) {
    var successSpan = document.createElement("span");
    successSpan.id = "success_span_" + headerId;
    successSpan.classList.add("badge", "badge-success", "float-right");

    var content = document.createTextNode(labelContent + " ✓")
    successSpan.appendChild(content);

    document.getElementById(headerId).appendChild(successSpan);
}

/**
 * Fill the rename actions number badge 
 *
 * @param {int} actionsNumber the number of rename actions
 */
function fillActionsNumberInfo(actionsNumber) {
    var actionsNumberBadge =
        document.getElementById("renameActionsNumberInfo");

    if (actionsNumber == 1) {
        var content = document.createTextNode("1 modification chargée");
    } else {
        var content = document.createTextNode(
            actionsNumber + " modifications chargées")
    }
    actionsNumberBadge.appendChild(content);
}

/**
 * Create the DOM node for a badge showing a count and an accompanying 
 * description
 * 
 * @param {string} badgeType the badge class to use
 * @param {int} count the count to display
 * @param {string} text_singular description when count is 1
 * @param {string} text_plural description when count is more than 1
 */
function createCounterBadge(badgeType, count, text_singular, text_plural) {
    var badgeSpan = document.createElement("span");
    badgeSpan.classList.add("badge", badgeType);

    if (count == 1) {
        var badgeContent = document.createTextNode("1 " + text_singular);
    } else {
        var badgeContent = document.createTextNode(count + " " + text_plural);
    }
    badgeSpan.appendChild(badgeContent);
    return badgeSpan;
}

/**
 * Add three badges to the top of the step 3 card: succesul modification count
 * warning count and failure count 
 *
 * @param {Object} resultCounter an object coutaining a field for each counter
 */
function addResultCounterBadges(resultCounter) {
    if (resultCounter.success >= 1) {
        var successSpan = createCounterBadge(
            "badge-success",
            resultCounter.success,
            "modication réalisée avec succès",
            "modifications réalisées avec succès"
        );
        document.getElementById("actionsResultContainer")
            .appendChild(successSpan);
    }

    if (resultCounter.warning >= 1) {
        var warningSpan = createCounterBadge(
            "badge-warning",
            resultCounter.warning,
            "erreur de nom",
            "erreurs de nom"
        );
        document.getElementById("actionsResultContainer")
            .appendChild(warningSpan);
    }

    if (resultCounter.failure >= 1) {
        var failureSpan = createCounterBadge(
            "badge-danger",
            resultCounter.failure,
            "GUID non trouvé",
            "GUID non trouvés"
        );
        document.getElementById("actionsResultContainer")
            .appendChild(failureSpan);
    }
}

/**
 * Actions to do to move from step 1 to step 2 
 * Add a badge in the header of step 1 with the loaded file name, change the
 * active header and move the accordion
 * 
 * @param {string} xmlFileName the name of the xml file loaded at step 1
 */
function progressToStep2(xmlFileName) {
    addSuccessLabelToHeader('heading_1', xmlFileName);
    document.getElementById("heading_1").classList.add("text-secondary");
    document.getElementById("heading_2").classList.remove("text-secondary");
    document.getElementById("applyRenameActionsButton")
        .removeAttribute("disabled");
    $('#collapse_2').collapse('toggle');
}

/**
 * Actions to do to move from step 2 to step 3 
 * Add a badge in the header of step 2 with the loaded file name, change the
 * active header, add a badge to the top of step 3 with the numner of loaded
 * actions and move the accordion
 * 
 * @param {string} csvFileName the name of the csv file loaded at step 2
 */
function progressToStep3(csvFileName, renameActionsArray) {
    displayCsvArray(renameActionsArray);

    addSuccessLabelToHeader('heading_2', csvFileName);
    document.getElementById("heading_2").classList.add("text-secondary");
    document.getElementById("heading_3").classList.remove("text-secondary");
    fillActionsNumberInfo(renameActionsArray.length);
    $('#collapse_3').collapse('toggle');
}

/**
 * Remove the Apply button at the top of the step 3 card
 */
function removeApplyButton() {
    document.getElementById("applyRenameActionsButton").remove();
}

/* XML file processing */

/**
 * Turn XML represented as text into a XML DOM Tree
 * 
 * @param {string} xmlContent a XML document represented as text
 */
function parseXML(xmlContent) {
    let parser = new DOMParser();
    xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    return xmlDoc;
}

/**
 * Turn a XML DOM Tree into text
 * 
 * @param {XMLDocument} xmldoc a XML DOM Tree
 */
function serializeXML(xmldoc) {
    var serializer = new XMLSerializer();
    var str = serializer.serializeToString(xmlDoc);
    return (str);
}

/**
 * Return a function performing a renaming action on the specified XML 
 * document
 * 
 * @param {XMLDocument} xmldoc a XML DOM Tree
 * @param {Object} resultCounter an object containing the success, warning
 * and failure counters
 */
function makeRenameAction(xmlDoc, resultCounter) {
    return (renameActionArray, actionIndex) => {
        // Start by finding the correct GUID
        var guidArray = Array.from(xmlDoc.getElementsByTagName("id"));
        var guidElem = guidArray.find((elem) =>
            elem.textContent == renameActionArray[0]);

        if (guidElem == null) {
            markRowAsFailure(actionIndex);
            resultCounter.failure += 1;
        } else {
            var libelleElem = guidElem;
            // Find the libelle tag by going through the guid siblings
            while (libelleElem != null && libelleElem.nodeName != "libelle") {
                libelleElem = libelleElem.nextSibling;
            }

            // If not found, mark as failure
            if (libelleElem == null) {
                markRowAsFailure(actionIndex);
                resultCounter.failure += 1;
            } else {
                // If the old name doesn't match, we do nothing and set a
                // warning unless the name is already the new name in which
                // case we do nothing
                if (libelleElem.textContent != renameActionArray[1]) {
                    if (libelleElem.textContent != renameActionArray[2]) {
                        markRowAsWarning(actionIndex);
                        resultCounter.warning += 1;
                    }
                } else {
                    libelleElem.innerHTML = renameActionArray[2];
                    markRowAsSuccess(actionIndex);
                    resultCounter.success += 1;
                }
            }
        }
    }
}

/**
 * Setup of a blob with the content of the processed xml file
 * Add a button to download it at the top of the step 3 card
 * 
 * @param {string} xmlTxtContent the processed XML content
 * @param {string} saveFileName the name of the file to download
 */
function enableSave(xmlTxtContent, saveFileName) {
    var data = new Blob([xmlTxtContent], { type: 'text/xml' });
    var xmlResultFile = window.URL.createObjectURL(data);

    var saveLink = document.createElement("a");
    saveLink.href = xmlResultFile;
    saveLink.classList.add("btn", "btn-success");
    saveLink.textContent = "Sauvegarder";
    saveLink.setAttribute("download", saveFileName);

    document.getElementById("actionButtons").appendChild(saveLink);
}

/* Callbacks */
function xmlFileSelectorCallback(xmlFileEvent) {
    let reader = new FileReader();
    let toModifyFile = xmlFileEvent.target.files[0];
    reader.readAsText(toModifyFile);

    reader.onload = function () {
        var xmlDoc = parseXML(reader.result);
        saveFileName = "renomme_" + toModifyFile.name;
        progressToStep2(toModifyFile.name);
    }
}

function csvFileSelectorCallback(csvFileEvent) {
    let reader = new FileReader();
    let csvFile = csvFileEvent.target.files[0];
    reader.readAsText(csvFile);

    reader.onload = function () {
        renameActionsArray = $.csv.toArrays(reader.result, { separator: "," });
        progressToStep3(csvFile.name, renameActionsArray);
    }
}

function applyRenameButtonCallback(applyEvent) {
    var resultCounter = {
        success: 0,
        warning: 0,
        failure: 0
    };

    renameActionsArray.forEach(makeRenameAction(xmlDoc, resultCounter));

    addResultCounterBadges(resultCounter);
    removeApplyButton();
    enableSave(serializeXML(xmlDoc), saveFileName);
}

/* Main logic */

function main() {
    // File selector element initialization
    $(document).ready(function () {
        bsCustomFileInput.init()
    });

    // Attach file selector callbacks
    document.getElementById('toModifyFileSelector').addEventListener(
        'change', xmlFileSelectorCallback);
    document.getElementById('rulesFileSelector').addEventListener(
        'change', csvFileSelectorCallback);

    // Set Apply button onClick action
    document.getElementById("applyRenameActionsButton").addEventListener(
        'click', applyRenameButtonCallback);
}

main();
