import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="pt-24 pb-24 min-h-screen">
      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
            The Manifesto
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic font-light mt-6 tracking-tight leading-[0.95]">
            Velocity of<br />
            <span className="text-accent">Tradition</span>
          </h1>
        </motion.div>
      </section>

      <div className="px-6 md:px-12"><div className="hairline" /></div>

      {/* Story */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent">01 — Origin</span>
            <h2 className="font-serif text-3xl md:text-4xl italic font-light mt-4 mb-6">
              Born from Contradiction
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.8]">
              H²F was born at the crossroads of two seemingly opposing worlds: the stoic elegance of 
              generational wealth and the kinetic energy of modern street culture. We saw the polo 
              shirt — that universal garment of quiet power — as the perfect vessel for this fusion.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-[1.8] mt-4">
              Every stitch carries the weight of tradition. Every silhouette pushes the boundary forward. 
              This is not compromise — this is evolution.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent">02 — Philosophy</span>
            <h2 className="font-serif text-3xl md:text-4xl italic font-light mt-4 mb-6">
              Disciplined Rebellion
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.8]">
              We believe that true style is not about following trends — it's about setting standards. 
              Our designs draw from the precision of bespoke tailoring and the audacity of youth culture. 
              The result is clothing that commands respect in any room.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-[1.8] mt-4">
              Premium pique cotton. Italian-informed cuts. A palette that speaks fluent 
              affluence. H²F is for those who understand that power is quiet, but ambition is loud.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-foreground text-primary-foreground px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary-foreground/50">
              03 — Values
            </span>
            <h2 className="font-serif text-4xl md:text-5xl italic font-light mt-4 mb-16">
              The <span className="text-accent">Code</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                number: '01',
                title: 'Uncompromising Quality',
                text: 'Every garment is crafted from the finest materials, designed to endure beyond seasons and trends.',
              },
              {
                number: '02',
                title: 'Cultural Fluency',
                text: 'We speak the language of heritage estates and city rooftops with equal eloquence.',
              },
              {
                number: '03',
                title: 'Silent Authority',
                text: 'True luxury doesn\'t announce itself. It arrives, and the room adjusts.',
              },
            ].map((value, i) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <span className="font-mono text-accent text-xs">{value.number}</span>
                <h3 className="font-serif text-xl italic font-light mt-3 mb-4">{value.title}</h3>
                <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl italic font-light">
            Ready to enter the <span className="text-accent">Archive</span>?
          </h2>
          <Link
            to="/shop"
            className="inline-block mt-8 font-mono text-xs tracking-[0.3em] uppercase px-10 py-4 border border-foreground/20 hover:border-accent hover:text-accent transition-all duration-500"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
