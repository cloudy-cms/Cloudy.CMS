﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cloudy.CMS.DocumentSupport
{
    public interface IDocumentGetter
    {
        Task<Document> GetAsync(string container, string id);
    }
}
