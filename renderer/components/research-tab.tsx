import { useState } from "react";
import { Button, Text, EmptyState } from "@glaze/core/components";
import { Plus, Trash2, MessageSquare, Globe, FileText } from "lucide-react";
import { useCanvasStore } from "../store";

export function ResearchTab() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const addQA = useCanvasStore((s) => s.addQA);
  const deleteQA = useCanvasStore((s) => s.deleteQA);
  const addWebsite = useCanvasStore((s) => s.addWebsiteResearch);
  const deleteWebsite = useCanvasStore((s) => s.deleteWebsiteResearch);
  const addForm = useCanvasStore((s) => s.addFormResult);
  const deleteForm = useCanvasStore((s) => s.deleteFormResult);

  const [qaQ, setQaQ] = useState("");
  const [qaA, setQaA] = useState("");
  const [qaSpeaker, setQaSpeaker] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [webNotes, setWebNotes] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");
  const [formResponses, setFormResponses] = useState<{ question: string; answer: string }[]>([]);

  const research = project?.research ?? { qa: [], websites: [], forms: [] };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 bg-app">
      {/* Q&A Transcriptions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="size-4 text-accent" />
          <Text variant="strong">Q&A Transcriptions</Text>
          <Text variant="mini" color="quaternary">
            {research.qa.length}
          </Text>
        </div>
        <div className="bg-popover border border-separator rounded-lg p-3 mb-3">
          <Text variant="small" className="font-medium block mb-2">
            Add transcription
          </Text>
          <div className="space-y-2">
            <input
              value={qaSpeaker}
              onChange={(e) => setQaSpeaker(e.target.value)}
              placeholder="Speaker (optional)"
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <input
              value={qaQ}
              onChange={(e) => setQaQ(e.target.value)}
              placeholder="Question"
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <textarea
              value={qaA}
              onChange={(e) => setQaA(e.target.value)}
              placeholder="Answer / transcription"
              rows={2}
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well resize-y"
            />
            <Button
              variant="accent"
              size="small"
              onClick={() => {
                if (!qaQ.trim() || !qaA.trim()) return;
                addQA({ question: qaQ.trim(), answer: qaA.trim(), speaker: qaSpeaker.trim() || undefined });
                setQaQ("");
                setQaA("");
                setQaSpeaker("");
              }}
              disabled={!qaQ.trim() || !qaA.trim()}
            >
              <Plus className="size-3.5" />
              Add Q&A
            </Button>
          </div>
        </div>
        {research.qa.length === 0 ? (
          <Text variant="small" color="tertiary">
            No transcriptions yet.
          </Text>
        ) : (
          <div className="space-y-2">
            {research.qa.map((qa) => (
              <div key={qa.id} className="bg-popover border border-separator rounded-lg p-3">
                <div className="flex justify-between gap-2">
                  <div>
                    <Text variant="small" className="font-medium">
                      Q: {qa.question}
                    </Text>
                    <Text variant="small" color="secondary" className="block mt-1">
                      A: {qa.answer}
                    </Text>
                    {qa.speaker && (
                      <Text variant="mini" color="quaternary" className="block mt-1">
                        Speaker: {qa.speaker} • {new Date(qa.createdAt).toLocaleString()}
                      </Text>
                    )}
                  </div>
                  <Button variant="glass" size="small" iconOnly onClick={() => deleteQA(qa.id)} aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Website Researches */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="size-4 text-accent" />
          <Text variant="strong">Website Researches</Text>
          <Text variant="mini" color="quaternary">
            {research.websites.length}
          </Text>
        </div>
        <div className="bg-popover border border-separator rounded-lg p-3 mb-3">
          <div className="space-y-2">
            <input
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://"
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <input
              value={webTitle}
              onChange={(e) => setWebTitle(e.target.value)}
              placeholder="Title"
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <textarea
              value={webNotes}
              onChange={(e) => setWebNotes(e.target.value)}
              placeholder="Notes / findings"
              rows={2}
              className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well resize-y"
            />
            <Button
              variant="accent"
              size="small"
              onClick={() => {
                if (!webUrl.trim()) return;
                addWebsite({ url: webUrl.trim(), title: webTitle.trim() || webUrl.trim(), notes: webNotes.trim() });
                setWebUrl("");
                setWebTitle("");
                setWebNotes("");
              }}
              disabled={!webUrl.trim()}
            >
              <Plus className="size-3.5" />
              Add website
            </Button>
          </div>
        </div>
        {research.websites.length === 0 ? (
          <Text variant="small" color="tertiary">
            No website researches yet.
          </Text>
        ) : (
          <div className="space-y-2">
            {research.websites.map((w) => (
              <div key={w.id} className="bg-popover border border-separator rounded-lg p-3">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Text variant="small" className="font-medium" truncate>
                      {w.title}
                    </Text>
                    <Text variant="mini" color="link" className="block truncate">
                      {w.url}
                    </Text>
                    {w.notes && (
                      <Text variant="small" color="secondary" className="block mt-1 whitespace-pre-wrap">
                        {w.notes}
                      </Text>
                    )}
                  </div>
                  <Button variant="glass" size="small" iconOnly onClick={() => deleteWebsite(w.id)} aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Results */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-accent" />
          <Text variant="strong">Form Results</Text>
          <Text variant="mini" color="quaternary">
            {research.forms.length}
          </Text>
        </div>
        <div className="bg-popover border border-separator rounded-lg p-3 mb-3">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form title"
            className="w-full px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well mb-2"
          />
          <div className="flex gap-2 mb-2">
            <input
              value={formQ}
              onChange={(e) => setFormQ(e.target.value)}
              placeholder="Question"
              className="flex-1 px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <input
              value={formA}
              onChange={(e) => setFormA(e.target.value)}
              placeholder="Answer"
              className="flex-1 px-2 py-1.5 border border-separator rounded-md text-[13px] bg-well"
            />
            <Button
              variant="glass"
              size="small"
              onClick={() => {
                if (!formQ.trim() || !formA.trim()) return;
                setFormResponses([...formResponses, { question: formQ.trim(), answer: formA.trim() }]);
                setFormQ("");
                setFormA("");
              }}
            >
              Add
            </Button>
          </div>
          {formResponses.length > 0 && (
            <div className="mb-2 space-y-1">
              {formResponses.map((r, i) => (
                <div key={i} className="flex justify-between gap-2 text-[13px] bg-well p-2 rounded">
                  <span>
                    <b>Q:</b> {r.question} <b>A:</b> {r.answer}
                  </span>
                  <button
                    onClick={() => setFormResponses(formResponses.filter((_, idx) => idx !== i))}
                    className="text-red text-[11px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="accent"
            size="small"
            onClick={() => {
              if (!formTitle.trim() || formResponses.length === 0) return;
              addForm({ formTitle: formTitle.trim(), responses: [...formResponses] });
              setFormTitle("");
              setFormResponses([]);
            }}
            disabled={!formTitle.trim() || formResponses.length === 0}
          >
            <Plus className="size-3.5" />
            Save form
          </Button>
        </div>
        {research.forms.length === 0 ? (
          <Text variant="small" color="tertiary">
            No form results yet.
          </Text>
        ) : (
          <div className="space-y-2">
            {research.forms.map((f) => (
              <div key={f.id} className="bg-popover border border-separator rounded-lg p-3">
                <div className="flex justify-between gap-2">
                  <div>
                    <Text variant="small" className="font-medium">
                      {f.formTitle}
                    </Text>
                    <Text variant="mini" color="quaternary">
                      {new Date(f.submittedAt).toLocaleString()} • {f.responses.length} answers
                    </Text>
                    <div className="mt-2 space-y-1">
                      {f.responses.map((r, i) => (
                        <Text key={i} variant="small" className="block bg-well p-2 rounded">
                          <b>Q:</b> {r.question} <br />
                          <b>A:</b> {r.answer}
                        </Text>
                      ))}
                    </div>
                  </div>
                  <Button variant="glass" size="small" iconOnly onClick={() => deleteForm(f.id)} aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
