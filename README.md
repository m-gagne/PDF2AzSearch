# PDF to Azure Search

This Azure Function binds to an Azure Storage container to process PDF files, extract metadata (using Regular Expressions), stores the result in DocumentDB (extracted text + captured metadata) which can then be used by Azure Search.

## Setup

1. Create a general purpose Azure Storage Account
1. Create a Document DB (using SQL API) service
1. Create Azure Function or use the [Azure Function Command Line](https://github.com/Azure/azure-functions-cli) utility.
1. Copy `settings.sample.json` to `local.settings.json` & edit as required with connection strings for the above Storage Account (for `AzureWebJobsStorage` & `BlobStore`) & DocumentDB (`DocumentDBConnectionString`).

## Rules engine

The [rules.json](functions/pdfmetafunc/rules.json) file contains regular expressions that are matched against the extracted text and stored as metadata.

### rules.json basics

The format for a rule is

    {
      "key": "<Metadata Name>",
      "type": "<Match Type>",
      "expression": "<Regular Expression>",
      "default": "<Default Value if no matches>"
      "startKeyword": "Optional: <Keyword for substring match start>",
      "endKeyword": "Optional: <Keyword for substring match end>",      
      "options": {
        "flags": "<Optional RegularExpression Flags>"
      }
    }

#### Rule Types:

* "FirstSingle" : Will capture the first match.
* "All" : Will capture all matches.
* "AllUnique" : Will capture all matches and return the list of unique strings.

#### Start/End Keywords

If you want to run your expression on a subset of the text, then specify the start/end keywords and only the text inbetween will be used.

## Sample PDF

The result of processing the sample file in [/sample/sample_doc.pdf](/sample/sample_doc.pdf) using the sample [rules.json](functions/pdfmetafunc/rules.json) is the following document being stored in DocumentDB:

        {
          "id": "dafe8948ef379e6aef78cc1b059122cebcae436d7dd878375f16094a99a9243b",
          "name": "sample_doc.pdf",
          "text": "Title: PDF to Text Function \nAuthor: Marc Gagne \n \nDescription:  \nAn azure function that extracts text from PDFs, runs the regular expression captures found in rules.json \nagainst the text and stores the results in DocumentDB. \n \nTechnologies used: \n• Azure Functions \n• pdf.js \n• JavaScript \n• Node.js \n \nGitHub: https://github.com/m-gagne/PDF2AzSearch \n ",
          "last_updated": "2017-05-23T20:10:31.653Z",
          "meta": {
            "Title": "PDF to Text Function",
            "Author": "Marc Gagne",
            "Description": "An azure function that extracts text from PDFs, runs the regular expression captures found in rules.json",
            "Technologies": [
              "Azure Functions",
              "pdf.js",
              "JavaScript",
              "Node.js"
            ]
          }
        }
