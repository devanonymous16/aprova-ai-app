
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, informe um e-mail válido.",
  }),
  whatsapp: z.string().min(10, {
    message: "Por favor, informe um número de WhatsApp válido.",
  }),
});

export default function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulando envio para a API
    setTimeout(() => {
      console.log(values);
      toast.success("Contato enviado com sucesso! Nossa equipe entrará em contato em breve.");
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <section id="contato-lead" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 font-heading">
              Ficou com dúvidas?
            </h2>
            <p className="text-lg text-gray-600">
              Deixe seus dados e nossa equipe entrará em contato para esclarecer todas as suas dúvidas
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary-600 hover:bg-primary-700" 
                  id="cta-form-contato"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Contato"}
                </Button>
              </form>
            </Form>
            
            <div id="form-feedback" className="mt-4 text-center text-sm text-gray-500">
              Ao enviar, você concorda com nossa <a href="#" className="text-primary-700 hover:underline">Política de Privacidade</a>.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
