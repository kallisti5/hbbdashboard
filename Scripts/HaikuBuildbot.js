/*
 * Copyright (C) 2011, 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

HaikuBuildbot = function()
{
    const queueInfo = {
        "haiku-master-x86_gcc2": {platform: Dashboard.Platform.x86_gcc2, builder: true, architecture: Buildbot.BuildArchitecture.x86_gcc2Target},
        "haiku-master-x86_64": {platform: Dashboard.Platform.x86_64, builder: true, architecture: Buildbot.BuildArchitecture.x86_64Target},
        "haiku-master-x86": {platform: Dashboard.Platform.x86, builder: true, architecture: Buildbot.BuildArchitecture.x86Target},
    };

    Buildbot.call(this, "https://buildbot.haiku-os.org/", queueInfo);
};

BaseObject.addConstructorFunctions(HaikuBuildbot);

HaikuBuildbot.prototype = {
    constructor: HaikuBuildbot,
    __proto__: Buildbot.prototype,
    performanceDashboardURL:  "https://perf.webkit.org",

    layoutTestResultsDirectoryURLForIteration: function(iteration)
    {
        return this.baseURL + "results/" + encodeURIComponent(iteration.queue.id) + "/" + encodeURIComponent("r" + iteration.openSourceRevision + " (" + iteration.id + ")");
    }
};
