﻿using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xunit;

namespace Tests
{
    public class ContentRouterTests
    {
        [Fact]
        public void RootPageWithNullUrlSegment()
        {
            var root = new Page
            {
                Id = "root",
                UrlSegment = null,
            };

            var result = new ContentRouter(new RootContentRouter(null, new TestContentSegmentRouter(root)), new TestRoutableRootContentProvider(root)).RouteContent(new List<string> { }, Enumerable.Empty<ContentTypeDescriptor>());

            Assert.Same(root, result);
        }

        [Fact]
        public void RootPageWithNonNullUrlSegment()
        {
            var root = new Page
            {
                UrlSegment = "lorem",
            };

            var result = new ContentRouter(new RootContentRouter(null, new TestContentSegmentRouter(root)), new TestRoutableRootContentProvider(root)).RouteContent(new List<string> { "lorem" }, Enumerable.Empty<ContentTypeDescriptor>());

            Assert.Same(root, result);
        }

        [Fact]
        public void PageUnderRootPageWithNonNullUrlSegment()
        {
            var root = new Page
            {
                Id = "root",
                UrlSegment = "lorem",
            };

            var page = new Page
            {
                ParentKeyValues = new object[] { root.Id },
                UrlSegment = "ipsum",
            };

            var result = new ContentRouter(new RootContentRouter(null, new TestContentSegmentRouter(root, page)), new TestRoutableRootContentProvider(root)).RouteContent(new List<string> { "lorem", "ipsum" }, Enumerable.Empty<ContentTypeDescriptor>());

            Assert.Same(page, result);
        }

        [Fact]
        public void PageUnderRootPageWithNullUrlSegment()
        {
            var root = new Page
            {
                Id = "root",
                UrlSegment = null,
            };

            var page = new Page
            {
                ParentKeyValues = new object[] { root.Id },
                UrlSegment = "ipsum",
            };

            var result = new ContentRouter(new RootContentRouter(null, new TestContentSegmentRouter(root, page)), new TestRoutableRootContentProvider(root)).RouteContent(new List<string> { "ipsum" }, Enumerable.Empty<ContentTypeDescriptor>());

            Assert.Same(page, result);
        }

        public class TestRoutableRootContentProvider : IRoutableRootContentProvider
        {
            IEnumerable<object> Content { get; }

            public TestRoutableRootContentProvider(params object[] content)
            {
                Content = content;
            }

            public IEnumerable<object> GetAll()
            {
                return Content;
            }
        }

        public class TestContentSegmentRouter : IContentSegmentRouter
        {
            IEnumerable<Page> Pages { get; }

            public TestContentSegmentRouter(params Page[] pages)
            {
                Pages = pages;
            }

            public object RouteContentSegment(object[] parentKeyValues, string segment, IEnumerable<ContentTypeDescriptor> types)
            {
                return Pages.FirstOrDefault(p => p.ParentKeyValues == parentKeyValues && p.UrlSegment == segment);
            }
        }

        public class Page : IHierarchical, IRoutable
        {
            public string Id { get; set; }
            public object[] ParentKeyValues { get; set; }
            public string UrlSegment { get; set; }
        }
    }
}
