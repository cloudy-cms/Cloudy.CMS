﻿using Cloudy.CMS.ContentSupport;
using System;
using System.Threading.Tasks;

namespace Cloudy.CMS.SingletonSupport
{
    public interface ISingletonGetter
    {
        Task<object> GetAsync(string contentTypeId);
        Task<T> GetAsync<T>() where T : class;
    }
}