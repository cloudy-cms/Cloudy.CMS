﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Cloudy.CMS.ContentSupport.RepositorySupport
{
    public interface IContentFinder
    {
        IContentFinderQuery Find(Type type);
        IContentFinderQuery Find<T>() where T : class;
    }
}
