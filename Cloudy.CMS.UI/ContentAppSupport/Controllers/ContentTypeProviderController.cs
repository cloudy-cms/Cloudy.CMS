﻿using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.ContentTypeSupport.GroupSupport;
using Cloudy.CMS.SingletonSupport;
using Cloudy.CMS.UI.ContentAppSupport.ContentTypeActionSupport;
using Cloudy.CMS.UI.ContentAppSupport.ListActionSupport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Cloudy.CMS.UI.ContentAppSupport.Controllers
{
    [Authorize("Cloudy.CMS.UI")]
    [Area("Cloudy.CMS")]
    public class ContentTypeProviderController
    {
        IContentTypeProvider ContentTypeProvider { get; }
        IHumanizer Humanizer { get; }
        IPluralizer Pluralizer { get; }
        ISingletonProvider SingletonProvider { get; }
        CamelCaseNamingStrategy CamelCaseNamingStrategy { get; } = new CamelCaseNamingStrategy();
        IContentTypeActionModuleProvider ContentTypeActionModuleProvider { get; }
        INameExpressionParser NameExpressionParser { get; }
        IImageExpressionParser ImageExpressionParser { get; }
        IListActionModuleProvider ListActionModuleProvider { get; }
        IContentTypeGroupMatcher ContentTypeGroupMatcher { get; }

        public ContentTypeProviderController(IContentTypeProvider contentTypeProvider, IHumanizer humanizer, IPluralizer pluralizer, ISingletonProvider singletonProvider, IContentTypeActionModuleProvider contentTypeActionModuleProvider, INameExpressionParser nameExpressionParser, IImageExpressionParser imageExpressionParser, IListActionModuleProvider listActionModuleProvider, IContentTypeGroupMatcher contentTypeGroupMatcher)
        {
            ContentTypeProvider = contentTypeProvider;
            Humanizer = humanizer;
            Pluralizer = pluralizer;
            SingletonProvider = singletonProvider;
            ContentTypeActionModuleProvider = contentTypeActionModuleProvider;
            NameExpressionParser = nameExpressionParser;
            ImageExpressionParser = imageExpressionParser;
            ListActionModuleProvider = listActionModuleProvider;
            ContentTypeGroupMatcher = contentTypeGroupMatcher;
        }

        public IEnumerable<ContentTypeResponseItem> GetAll()
        {
            var result = new List<ContentTypeResponseItem>();

            foreach (var contentType in ContentTypeProvider.GetAll())
            {
                result.Add(GetItem(contentType));
            }

            return result.AsReadOnly();
        }

        ContentTypeResponseItem GetItem(ContentTypeDescriptor contentType)
        {
            var name = contentType.Type.GetCustomAttribute<DisplayAttribute>()?.Name ?? contentType.Type.Name;
            string pluralName;

            if (name.Contains(':') && !contentType.Id.Contains(':'))
            {
                var nameSplit = name.Split(':');

                name = nameSplit.First();
                pluralName = nameSplit.Last();
            }
            else
            {
                name = Humanizer.Humanize(name);
                pluralName = Pluralizer.Pluralize(name);
            }

            var singleton = SingletonProvider.Get(contentType.Id);

            var item = new ContentTypeResponseItem
            {
                Id = contentType.Id,
                Name = name,
                LowerCaseName = name.Substring(0, 1).ToLower() + name.Substring(1),
                PluralName = pluralName,
                LowerCasePluralName = pluralName.Substring(0, 1).ToLower() + pluralName.Substring(1),
                IsNameable = typeof(INameable).IsAssignableFrom(contentType.Type),
                NameablePropertyName = typeof(INameable).IsAssignableFrom(contentType.Type) ? CamelCaseNamingStrategy.GetPropertyName(NameExpressionParser.Parse(contentType.Type), false) : null,
                IsImageable = typeof(IImageable).IsAssignableFrom(contentType.Type),
                ImageablePropertyName = typeof(IImageable).IsAssignableFrom(contentType.Type) ? CamelCaseNamingStrategy.GetPropertyName(ImageExpressionParser.Parse(contentType.Type), false) : null,
                IsRoutable = typeof(IRoutable).IsAssignableFrom(contentType.Type),
                IsSingleton = singleton != null,
                Count = -1,
                ContentTypeActionModules = ContentTypeActionModuleProvider.GetContentTypeActionModulesFor(contentType.Id),
                ListActionModules = ListActionModuleProvider.GetListActionModulesFor(contentType.Id),
                ContentTypeGroups = ContentTypeGroupMatcher.GetContentTypeGroupsFor(contentType.Id).Select(t => t.Id).ToList().AsReadOnly(),
            };
            return item;
        }

        public class ContentTypeResponseItem
        {
            public string Id { get; set; }
            public string Name { get; set; }
            public string LowerCaseName { get; set; }
            public string PluralName { get; set; }
            public string LowerCasePluralName { get; set; }
            public bool IsNameable { get; set; }
            public string NameablePropertyName { get; set; }
            public bool IsImageable { get; set; }
            public string ImageablePropertyName { get; set; }
            public bool IsRoutable { get; set; }
            public bool IsSingleton { get; set; }
            public string SingletonId { get; set; }
            public int Count { get; set; }
            public IEnumerable<string> ContentTypeActionModules { get; set; }
            public IEnumerable<string> ListActionModules { get; set; }
            public IEnumerable<string> ContentTypeGroups { get; set; }
        }
    }
}
