// DOM Manipulation

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
    successSpan.classList.add("badge");
    successSpan.classList.add("badge-success");
    successSpan.classList.add("float-right");

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
    var actionsNumberBadge = document.getElementById("renameActionsNumberInfo");

    if (actionsNumber == 1) {
        var content = document.createTextNode("1 modification chargée");
    } else {
        var content = document.createTextNode(
            actionsNumber + " modifications chargées")
    }
    actionsNumberBadge.appendChild(content);
}

// CSV file processing

function rulesFileSelectorChangedCallback(renameActionsArray) {
    return (event) => {
        const fileList = event.target.files;

        let reader = new FileReader();
        reader.readAsText(fileList[0]);

        reader.onload = function () {
            renameActionsArray = $.csv.toArrays(reader.result);
            displayCsvArray(renameActionsArray);

            addSuccessLabelToHeader('heading_2', fileList[0].name);
            document.getElementById("heading_2").classList.add("text-secondary");
            document.getElementById("heading_3").classList.remove("text-secondary");
            fillActionsNumberInfo(renameActionsArray.length);
            $('#collapse_3').collapse('toggle');
        };
    }
}

// XML file processing

function toModifyFileSelectorChangedCallback(xmlDoc) {
    return (event) => {
        const fileList = event.target.files;

        let reader = new FileReader();
        reader.readAsText(fileList[0]);

        reader.onload = function () {
            let parser = new DOMParser();
            xmlDoc = parser.parseFromString(reader.result, "text/xml");
            console.log(xmlDoc);

            addSuccessLabelToHeader('heading_1', fileList[0].name);
            document.getElementById("heading_1").classList.add("text-secondary");
            document.getElementById("heading_2").classList.remove("text-secondary");
            $('#collapse_2').collapse('toggle');
        }
    }
}

// Main logic

function main() {
    // Declaration
    var renameActionsArray = [];
    var xmlDoc;

    // File selector element initialization
    $(document).ready(function () {
        bsCustomFileInput.init()
    });

    // Attach file selector callbacks
    document.getElementById('rulesFileSelector').addEventListener(
        'change',
        rulesFileSelectorChangedCallback(renameActionsArray));

    document.getElementById('toModifyFileSelector').addEventListener(
        'change',
        toModifyFileSelectorChangedCallback(xmlDoc));
}

main();