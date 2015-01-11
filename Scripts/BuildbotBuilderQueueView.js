/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

BuildbotBuilderQueueView = function(debugQueues, releaseQueues)
{
    BuildbotQueueView.call(this, debugQueues, releaseQueues);

    function filterQueuesByArchitecture(architecture, queue)
    {
        return queue.architecture === architecture;
    }

    this.x86_64ReleaseQueues = this.releaseQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86_64));
    this.x86ReleaseQueues = this.releaseQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86));
    this.x86_gcc2ReleaseQueues = this.releaseQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86_gcc2));

    this.x86_64DebugQueues = this.debugQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86_64));
    this.x86DebugQueues = this.debugQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86));
    this.x86_gcc2DebugQueues = this.debugQueues.filter(filterQueuesByArchitecture.bind(this, Buildbot.BuildArchitecture.x86_gcc2));

    this.hasMultipleReleaseBuilds = this.releaseQueues.length > 1;
    this.hasMultipleDebugBuilds = this.debugQueues.length > 1;

    this.update();
};

BaseObject.addConstructorFunctions(BuildbotBuilderQueueView);

BuildbotBuilderQueueView.prototype = {
    constructor: BuildbotBuilderQueueView,
    __proto__: BuildbotQueueView.prototype,

    update: function()
    {
        BuildbotQueueView.prototype.update.call(this);

        this.element.removeChildren();

        function appendBuilderQueueStatus(queue)
        {
            if (queue.buildbot.needsAuthentication && !queue.buildbot.isAuthenticated) {
                this._appendUnauthorizedLineView(queue);
                return;
            }

            this._appendPendingRevisionCount(queue);

            var firstRecentUnsuccessfulIteration = queue.firstRecentUnsuccessfulIteration;
            var mostRecentFinishedIteration = queue.mostRecentFinishedIteration;
            var mostRecentSuccessfulIteration = queue.mostRecentSuccessfulIteration;

            if (firstRecentUnsuccessfulIteration && firstRecentUnsuccessfulIteration.loaded
                && mostRecentFinishedIteration && mostRecentFinishedIteration.loaded) {
                console.assert(!mostRecentFinishedIteration.successful);
                var message = this.revisionContentForIteration(mostRecentFinishedIteration, mostRecentFinishedIteration.productive ? mostRecentSuccessfulIteration : null);
                if (mostRecentFinishedIteration.failed) {
                    // Assume it was a build step that failed, and link directly to output.
                    var url = mostRecentFinishedIteration.failureLogURL("build log");
                    if (!url)
                        url = mostRecentFinishedIteration.failureLogURL("stdio");
                    var status = StatusLineView.Status.Bad;
                } else
                    var status = StatusLineView.Status.Danger;

                // Show a popover when the URL is not a main build page one, because there are usually multiple logs, and it's good to provide a choice.
                var needsPopover = !!url;

                // Some other step failed, link to main buildbot page for the iteration.
                if (!url)
                    url = queue.buildbot.buildPageURLForIteration(mostRecentFinishedIteration);
                var status = new StatusLineView(message, status, mostRecentFinishedIteration.text, null, url);
                this.element.appendChild(status.element);

                if (needsPopover)
                    new PopoverTracker(status.statusBubbleElement, this._presentPopoverFailureLogs.bind(this), mostRecentFinishedIteration);
            }

            if (mostRecentSuccessfulIteration && mostRecentSuccessfulIteration.loaded) {
                var message = this.revisionContentForIteration(mostRecentSuccessfulIteration);
                var url = queue.buildbot.buildPageURLForIteration(mostRecentSuccessfulIteration);
                var status = new StatusLineView(message, StatusLineView.Status.Good, firstRecentUnsuccessfulIteration ? "last successful build" : "latest build", null, url);
                this.element.appendChild(status.element);
            } else {
                var status = new StatusLineView("unknown", StatusLineView.Status.Neutral, firstRecentUnsuccessfulIteration ? "last successful build" : "latest build");            
                this.element.appendChild(status.element);

                if (firstRecentUnsuccessfulIteration) {
                    // We have a failed iteration but no successful. It might be further back in time.
                    queue.loadMoreHistoricalIterations();
                }
            }
        }

        function appendBuildArchitecture(queues, label)
        {
            queues.forEach(function(queue) {
                var releaseLabel = document.createElement("a");
                releaseLabel.classList.add("queueLabel");
                releaseLabel.textContent = label;
                releaseLabel.href = queue.overviewURL;
                releaseLabel.target = "_blank";
                this.element.appendChild(releaseLabel);

                appendBuilderQueueStatus.call(this, queue);
            }.bind(this));
        }

        appendBuildArchitecture.call(this, this.x86_64ReleaseQueues, this.hasMultipleReleaseBuilds ? "Release (x86_64)" : "Release");
        appendBuildArchitecture.call(this, this.x86ReleaseQueues, this.hasMultipleReleaseBuilds ? "Release (x86)" : "Release");
        appendBuildArchitecture.call(this, this.x86_gcc2ReleaseQueues, this.hasMultipleReleaseBuilds ? "Release (x86_gcc2)" : "Release");

        appendBuildArchitecture.call(this, this.x86_64DebugQueues, this.hasMultipleDebugBuilds ? "Debug (x86_64)" : "Debug");
        appendBuildArchitecture.call(this, this.x86DebugQueues, this.hasMultipleDebugBuilds ? "Debug (x86)" : "Debug");
        appendBuildArchitecture.call(this, this.x86_gcc2DebugQueues, this.hasMultipleDebugBuilds ? "Debug (x86_gcc2)" : "Debug");
    },

    _presentPopoverFailureLogs: function(element, popover, iteration)
    {
        var content = document.createElement("div");
        content.className = "build-logs-popover";

        function addLog(name, url) {
            var line = document.createElement("a");
            line.className = "build-log-link";
            line.href = url;
            line.textContent = name;
            line.target = "_blank";
            content.appendChild(line);
        }

        this._addIterationHeadingToPopover(iteration, content);
        this._addDividerToPopover(content);
        
        var logsHeadingLine = document.createElement("div");
        logsHeadingLine.className = "build-logs-heading";
        logsHeadingLine.textContent = iteration.firstFailedStepName + " failed";
        content.appendChild(logsHeadingLine);

        for (var i = 0, end = iteration.failureLogs.length; i < end; ++i)
            addLog(iteration.failureLogs[i][0], iteration.failureLogs[i][1]);

        var rect = Dashboard.Rect.rectFromClientRect(element.getBoundingClientRect());
        popover.content = content;
        popover.present(rect, [Dashboard.RectEdge.MIN_Y, Dashboard.RectEdge.MAX_Y, Dashboard.RectEdge.MAX_X, Dashboard.RectEdge.MIN_X]);
        return true;
    }
};
