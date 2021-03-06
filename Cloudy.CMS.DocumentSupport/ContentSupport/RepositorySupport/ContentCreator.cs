﻿using Cloudy.CMS.ContentTypeSupport;
using System;
using System.Threading.Tasks;
using Cloudy.CMS.ContentSupport.Serialization;
using Cloudy.CMS.DocumentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport.ListenerSupport;

namespace Cloudy.CMS.ContentSupport.RepositorySupport
{
    public class ContentCreator : IContentCreator
    {
        IDocumentCreator DocumentCreator { get; }
        IIdGenerator IdGenerator { get; }
        IContentTypeProvider ContentTypeRepository { get; }
        ISaveListenerProvider SaveListenerProvider { get; }
        IContentSerializer ContentSerializer { get; }

        public ContentCreator(IDocumentCreator documentCreator, IIdGenerator idGenerator, IContentTypeProvider contentTypeRepository, ISaveListenerProvider saveListenerProvider, IContentSerializer contentSerializer)
        {
            DocumentCreator = documentCreator;
            IdGenerator = idGenerator;
            ContentTypeRepository = contentTypeRepository;
            SaveListenerProvider = saveListenerProvider;
            ContentSerializer = contentSerializer;
        }

        public async Task CreateAsync(IContent content)
        {
            if (content.Id != null)
            {
                throw new InvalidOperationException($"This content seems to already exist as it has a non-null Id ({content.Id}). Did you mean to use IContentUpdater?");
            }

            var contentType = ContentTypeRepository.Get(content.GetType());

            if (contentType == null)
            {
                throw new TypeNotRegisteredContentTypeException(content.GetType());
            }

            content.Id = IdGenerator.Generate();
            content.ContentTypeId = contentType.Id;

            foreach (var saveListener in SaveListenerProvider.GetFor(content))
            {
                saveListener.BeforeSave(content);
            }

            await DocumentCreator.Create(contentType.Container, ContentSerializer.Serialize(content, contentType));
        }
    }
}
