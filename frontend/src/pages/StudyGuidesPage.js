export default function StudyGuidesPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#3B7962] mb-4">Study Guides</h1>
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <div className="prose">
        <p className="mb-4">
          Managing stress involves techniques like mindfulness and regular
          physical activity to help calm the mind and body. Setting realistic
          goals and maintaining a healthy lifestyle, including sleep and diet,
          are essential for coping effectively.
        </p>
        <p className="mb-4">
          Seeking support from loved ones or a counselor can provide relief and
          guidance during stressful times. Remember that stress is a normal part
          of life, and learning to manage it effectively can improve your
          overall wellbeing.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-2">Key Techniques:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Deep breathing exercises</li>
          <li>Progressive muscle relaxation</li>
          <li>Mindfulness meditation</li>
          <li>Regular physical exercise</li>
          <li>Time management strategies</li>
        </ul>
      </div>
    </div>
  );
}
