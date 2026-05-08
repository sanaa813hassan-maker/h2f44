import { motion } from 'framer-motion';

export default function StatCard({ label, value, sublabel, icon: Icon, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">{label}</p>
          <p className="font-serif text-3xl font-light text-white mt-2">{value}</p>
          {sublabel && (
            <p className="font-mono text-[10px] tracking-wider text-[#C5A059] mt-2">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-white/5">
            <Icon className="w-5 h-5 text-[#C5A059]" />
          </div>
        )}
      </div>
      {/* Glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-3xl" />
    </motion.div>
  );
}
