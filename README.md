# PDF to Azure Search

This Azure Function binds to an Azure Storage container to process PDF files, extract metadata (using Regular Expressions), augment the PDF with the results and push the document to Azure Search for indexing.

## Setup

1. Copy `settings.sample.json` to `local.settings.json` & edit as required.
  * For local testing (using the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/storage-use-emulator)) you can use this connection string
          
          DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;