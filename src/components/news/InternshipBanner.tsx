import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const InternshipBanner = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-accent"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 lg:p-10">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white/90">Now Accepting Applications</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Start Your Journalism Career
                </h3>
                <p className="mt-1 text-sm md:text-base text-white/80 max-w-xl">
                  Join our internship program and gain hands-on experience in authentic, fact-based journalism.
                </p>
              </div>
            </div>

            <Link to="/internship">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
              >
                Apply for Internship
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
