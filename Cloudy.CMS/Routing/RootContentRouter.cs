﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentTypeSupport;

namespace Cloudy.CMS.Routing
{
    public class RootContentRouter : IRootContentRouter
    {
        IPrimaryKeyGetter PrimaryKeyGetter { get; }
        IContentSegmentRouter ContentSegmentRouter { get; }

        public RootContentRouter(IPrimaryKeyGetter primaryKeyGetter, IContentSegmentRouter contentSegmentRouter)
        {
            PrimaryKeyGetter = primaryKeyGetter;
            ContentSegmentRouter = contentSegmentRouter;
        }

        public object Route(object root, IEnumerable<string> segments, IEnumerable<ContentTypeDescriptor> types)
        {
            if (!segments.Any())
            {
                if (((IRoutable)root).UrlSegment == null && (!types.Any() || types.Any(t => t.Type == root.GetType())))
                {
                    return root;
                }
                
                return null;
            }

            if (((IRoutable)root).UrlSegment != null && ((IRoutable)root).UrlSegment.Equals(segments.First()))
            {
                segments = segments.Skip(1);
            }

            object content = root;

            while (segments.Any())
            {
                content = ContentSegmentRouter.RouteContentSegment(PrimaryKeyGetter.Get(content), segments.First(), types);

                if (content == null)
                {
                    return null;
                }

                if(types.Any() && !types.Any(t => t.Type == root.GetType()))
                {
                    return null;
                }

                segments = segments.Skip(1);
            }

            return content;
        }
    }
}
