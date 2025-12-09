import { SpeakingIeltsResponse } from './speaking-result-display';

// Mock data from the backend
const mockData = {
    session_id: 'c0a83801-9aff-140c-819a-ff04efd00000',
    transcript:
        "Well, it depends, but successful people can sometimes feel lonely, like they're standing on a mountain top alone. Chasing big goals often means sacrificing time with friends or family, which can lead them isolated, especially if they're workaholics. For example, a CEO might have all the accolades but miss out on casual hangouts, you know, because their schedules packed. On the flip side, success can also attract shallow connections, making it hard to find genuine relationships. I believe loneliness creeps in when success overshadows balance, but it's not a universal rule.",
    duration: 35,
    word_count: 117,
    overall_band: 7,
    fluency_band: 7,
    lexical_band: 7,
    grammar_band: 7,
    pronunciation_band: 7,
    feedback: {
        overall: 'Overall Band: 7.0',
        fluency: {
            band: 7,
            feedback:
                "The speaker demonstrates good fluency with natural pacing and minimal hesitation. They effectively use discourse markers like 'For example' and 'On the flip side' to connect ideas, and the response is well-organized and coherent, addressing the question directly.",
            strengths: [
                'Natural pace and flow',
                'Effective use of discourse markers',
                'Logical organization of ideas',
            ],
            weaknesses: ['Occasional minor repetition of ideas'],
            improvements: [
                'Vary sentence beginnings more',
                'Use a wider range of cohesive devices',
            ],
        },
        lexical: {
            band: 7,
            feedback:
                "The speaker uses a good range of vocabulary, including less common items like 'accolades', 'hangouts', and 'workaholics'. Collocations are generally accurate, and there's an attempt to use idiomatic language ('creeps in', 'overshadows').",
            strengths: [
                'Use of less common vocabulary',
                'Accurate collocations',
                'Attempt at idiomatic language',
            ],
            weaknesses: ["Some repetition of 'success'"],
            improvements: [
                "Learn synonyms for common words like 'success'",
                'Experiment with more nuanced idiomatic expressions',
            ],
        },
        grammar: {
            band: 7,
            feedback:
                "The speaker uses a good mix of simple and complex sentence structures, including relative clauses ('which can lead them isolated') and conditional structures ('if they're workaholics'). Errors are infrequent and do not impede communication.",
            strengths: [
                'Variety of sentence structures',
                'Accurate use of complex sentences',
                'Few grammatical errors',
            ],
            weaknesses: ["Minor awkward phrasing ('lead them isolated')"],
            improvements: [
                'Ensure subject-verb agreement in all clauses',
                'Refine phrasing for more natural flow',
            ],
        },
        pronunciation: {
            band: 7,
            feedback:
                "The speaker's pronunciation is generally clear and easy to understand. Intonation is mostly appropriate, with good use of stress on key words like 'lonely', 'sacrificing', and 'connections'. There are no significant issues with clarity or articulation.",
            strengths: [
                'Clear articulation',
                'Appropriate word stress',
                'Good use of intonation to convey meaning',
            ],
            weaknesses: [
                'Slightly flat intonation at times',
                "Occasional minor mispronunciation of 'workaholics'",
            ],
            improvements: [
                'Vary intonation more to sound more engaging',
                'Practice pronunciation of less common words',
            ],
        },
    },
    confidence_score: 0.8,
    model_used: 'gemini-2.5-flash-audio',
    model_version: 'gemini-2.5-flash',
    fallback_occurred: false,
    estimated_cost: 0.007096000000000001,
    token_usage: {
        input_tokens: 1862,
        output_tokens: 755,
        total_tokens: 2617,
    },
    latency_ms: 0,
    evaluated_at: 111482,
};

export default function Page() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-orange-100">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                    <div className="mb-6">
                        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">
                            IELTS Speaking Results
                        </h1>
                        <p className="text-base text-slate-600">
                            AI-Powered Performance Analysis
                        </p>
                    </div>

                    <SpeakingIeltsResponse data={mockData} />
                </div>
            </div>
        </main>
    );
}
