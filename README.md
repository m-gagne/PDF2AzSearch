# PDF to Azure Search

This Azure Function binds to an [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/storage-create-storage-account) Blob container and triggers when a PDF file is stored. The function extracts text from the PDF file using [pdf.js](https://github.com/mozilla/pdf.js) and using the supplies rules extrats metadata from the text & stores the result (text + metadata) in a [DocumentDB](https://azure.microsoft.com/en-us/services/cosmos-db/) collection which can then be used as a datasource for [Azure Search](https://azure.microsoft.com/en-us/services/search/).


## Prerequisites

1. You must have an active Azure Subscription, if you do not you can always start with a [free trial](https://azure.microsoft.com/en-ca/free/)
1. General understanding of
  * [Resource Groups](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview)
  * [Azure Storage Accounts](https://docs.microsoft.com/en-us/azure/storage/storage-create-storage-account)
  * [Document DB](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction)  
  * [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview)
  * [Azure Search](https://docs.microsoft.com/en-us/azure/search/)


## Tools

* The [Azure Storage Explorer](http://storageexplorer.com/) is handy for creating containers and uploading/deleting files.
* [Postman](https://www.getpostman.com/) is fantastic for making REST calls and storing them for re-use. Later I will include a Postman collection for search.

## Setup

### Infrastructure

1. *Optional (but recommended)*: Create a [Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview) to contain the resources you will create below.
1. Create an [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/storage-create-storage-account) (General-Purpose or Blob, either will work)
    * Create a public or private (depending on your needs) blob container called `inbound`
    * I suggest using the [Azure Storage Explorer](http://storageexplorer.com/) tool for this.
1. Create a [Document DB (using the SQL API)](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) service, follow the steps **Create a database account** [here](https://docs.microsoft.com/en-us/azure/cosmos-db/create-documentdb-dotnet)
    * Be sure to create a database called `documents` and a collection called `docs`
    * For testing when creating your collection start with the smallest/cheapest configuration which would be
      * Fixed Capacity(10GB)
      * 400 RU's
      * No partition key
1. Create an [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) or use the [Azure Function Command Line](https://github.com/Azure/azure-functions-cli) utility to run this function locally
    * If you fork this repo you can use the [continious deployment](https://docs.microsoft.com/en-us/azure/azure-functions/functions-continuous-deployment) option.
    * I suggest using the `Consumption Plan` for testing and small/medium workloads.
  * Since you already have a storage account that you previously created, I would suggest using that instead of creating a seperate one.
1. Create an [Azure Search](https://docs.microsoft.com/en-us/azure/search/search-create-service-portal) instance
    * *Tip*: Use the Free pricing tier for testing!

### Configuration

See [functions/settings.sample.json](functions/settings.sample.json) for all Azure Function app settings.

1. In you Azure Function you will need to supply a few [App Settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings), specifically
    * `BlobStore` : The Azure Storage Account connection string which you can find in the `Access keys` blade for your Storage Account. The function will trigger whenever a .pdf file is uploaded into the `uploads` container of this storage account, again I recommend using the [Azure Storage Explorer](http://storageexplorer.com/) for this.
      * *Note:* `AzureWebJobsStorage` & `BlobStore` can be the same or different storage accounts depending on your needs.
    * `DocumentDBConnectionString` : Connection string to your Azure DocumentDB database. This can be found in the `Keys` blade of your DocumentDB under `PRIMARY CONNECTION STRING`

### Quick Test

Once your funtion is running you can upload the `sample/sample_doc.pdf` into the `inbound` container, which will trigger the function. If it works you should see output in the Function logs like so:

    Function started (Id=28dce41e-474c-42c8-9f9b-da82072ce4fb)
    Updating document => dafe8948ef379e6aef78cc1b059122cebcae436d7dd878375f16094a99a9243b
    Metadata found => {
        "Title": "PDF to Text Function",
        "Author": "Marc Gagne",
        "Description": "An azure function that extracts text from PDFs, runs the regular expression captures found in rules.json \nagainst the text and stores the results in DocumentDB.",
        "Technologies": [
            "Azure Functions",
            "pdf.js",
            "JavaScript",
            "Node.js"
        ]
    }
    Function completed (Success, Id=28dce41e-474c-42c8-9f9b-da82072ce4fb, Duration=286ms)


## Rules engine

The [rules.json](functions/pdfmetafunc/rules.json) file contains the regular expressions rules that are matched against the extracted text and stored as metadata.

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

#### More on rules:

This function uses the [TextMeta](https://github.com/m-gagne/textmeta) module which is a text extraction and rules engine. To learn more about the rules/how the text is extracted please refer to the [TextMeta GitHub repo](https://github.com/m-gagne/textmeta).

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


## Search

To configure search to index data from your Document I highly recommend getting familiar with the [Azure Search REST APIs](https://docs.microsoft.com/en-us/rest/api/searchservice/) which I find more efficient (once you learn them) than using the portal/code.

The included [search/PDF2Search.postman_collection.json](search/PDF2Search.postman_collection.json) [Postman](https://www.getpostman.com/) collection contains the basics required to create the data source (DocumentDB), the index (search schema) and the indexer (reads from data source and indexes data using the configured index) as well as a very simple search query.

1. Open Postman, click `Import` and import the [search/PDF2Search.postman_collection.json](search/PDF2Search.postman_collection.json) collection.
1. Configure your [environment variables in Postman](https://www.getpostman.com/docs/environments) to include
    * `DocDbConnectionString` : Which is the connection string for your DocumentDB database.
        * Note: When setting your DocumentDB connection string as the data source, you will need to include the Database name in the string like so `AccountEndpoint=https://[your account name].documents.azure.com;AccountKey=[your account key];Database=[your database id]`
    * `SearchAdminKey` : Your Azure Search admin key (so you can create/delete data sources, indexes, indexers etc.)
    * `SearchAccountName` : The name of your Azure Search service
        * Note: This is just the *name* not the full *url*.
1. In the `001 - Setup` folder `Send` the `Create Data Source`, `Create Index` & `Create Indexer` requests.
    * You should look at the `Body` of each of these requests to better understand what they are doing
1. After a brief moment (give it a minute) you should now be able to run the `002 - Searches/Sample Query` request to search your document!