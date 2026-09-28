
'use client';

export function BodyChallengeSection() {
  return (
    <section id="body-challenge" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
            헬스보이짐 <span className="text-primary">바디챌린지</span>
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Challenge to Change
          </p>
        </div>
        <div className="w-full max-w-6xl mx-auto">
          <div className="aspect-[4/3] md:aspect-video w-full">
            <iframe
              src="https://studio--body-challenge-hub.us-central1.hosted.app"
              title="헬스보이짐 바디챌린지"
              className="w-full h-full border-2 border-border/50 rounded-lg shadow-lg"
              allow="fullscreen"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
