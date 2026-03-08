"use client";

import { FrameType, PICOFrame, HMWFrame, IssueTreeFrame, FreeFormFrame, FrameData } from "@/types/framing";

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

function Field({ label, hint, value, onChange, required }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        {required && <span className="text-[10px] text-red-400">*</span>}
      </div>
      <p className="text-[11px] text-gray-400 -mt-0.5">{hint}</p>
      <textarea
        className="w-full min-h-[64px] text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 resize-none placeholder:text-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
      />
    </div>
  );
}

interface PICOFieldsProps {
  data: PICOFrame;
  onChange: (data: PICOFrame) => void;
}
export function PICOFields({ data, onChange }: PICOFieldsProps) {
  const set = (key: keyof PICOFrame) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-4">
      <Field label="P — Population" hint="Who is being studied?" value={data.p} onChange={set("p")} required />
      <Field label="I — Intervention" hint="What action, change, or factor?" value={data.i} onChange={set("i")} required />
      <Field label="C — Comparison" hint="Compared to what baseline?" value={data.c} onChange={set("c")} />
      <Field label="O — Outcome" hint="What is measured or observed?" value={data.o} onChange={set("o")} required />
      <Field label="T — Time" hint="Over what time period?" value={data.t} onChange={set("t")} />
    </div>
  );
}

interface HMWFieldsProps {
  data: HMWFrame;
  onChange: (data: HMWFrame) => void;
}
export function HMWFields({ data, onChange }: HMWFieldsProps) {
  const set = (key: keyof HMWFrame) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-4">
      <Field label="How Might We..." hint="The full HMW statement (start with 'How might we...')" value={data.hmw} onChange={set("hmw")} required />
      <Field label="User" hint="Who we're designing for" value={data.user} onChange={set("user")} required />
      <Field label="Context" hint="When/where this happens" value={data.context} onChange={set("context")} />
      <Field label="Goal" hint="What they're trying to achieve" value={data.goal} onChange={set("goal")} />
      <Field label="Constraint" hint="What makes this difficult" value={data.constraint} onChange={set("constraint")} />
    </div>
  );
}

interface IssueTreeFieldsProps {
  data: IssueTreeFrame;
  onChange: (data: IssueTreeFrame) => void;
}
export function IssueTreeFields({ data, onChange }: IssueTreeFieldsProps) {
  const set = (key: keyof IssueTreeFrame) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-4">
      <Field label="Core Question" hint="The main question restated precisely" value={data.core_question} onChange={set("core_question")} required />
      <Field label="Branch 1" hint="First key sub-question or hypothesis" value={data.branch_1} onChange={set("branch_1")} required />
      <Field label="Branch 2" hint="Second key sub-question or hypothesis" value={data.branch_2} onChange={set("branch_2")} />
      <Field label="Branch 3" hint="Third sub-question (optional)" value={data.branch_3} onChange={set("branch_3")} />
      <Field label="Key Metrics" hint="How will we know we've answered the question?" value={data.key_metrics} onChange={set("key_metrics")} />
    </div>
  );
}

interface FreeFormFieldsProps {
  data: FreeFormFrame;
  onChange: (data: FreeFormFrame) => void;
}
export function FreeFormFields({ data, onChange }: FreeFormFieldsProps) {
  const set = (key: keyof FreeFormFrame) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-4">
      <Field label="Research Question" hint="Your core research question" value={data.research_question} onChange={set("research_question")} required />
      <Field label="Scope" hint="What's in / out of scope" value={data.scope} onChange={set("scope")} />
      <Field label="Success Criteria" hint="How will we know we're done?" value={data.success_criteria} onChange={set("success_criteria")} />
    </div>
  );
}
