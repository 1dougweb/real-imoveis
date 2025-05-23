import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { CategoryForm } from "./CategoryForm";
import { financialService } from "@/lib/services";

const transactionSchema = z.object({
  type: z.enum(["receivable", "payable"]),
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser um número positivo",
  }),
  due_date: z.date(),
  category: z.string().min(1, "Categoria é obrigatória"),
  person_id: z.string().optional(),
  contract_id: z.string().optional(),
  bank_account_id: z.string().optional(),
  payment_type_id: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  isLoading = false,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedType, setSelectedType] = useState<"receivable" | "payable">(
    initialData?.type || "receivable"
  );

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "receivable",
      description: "",
      amount: "",
      category: "",
      notes: "",
      ...initialData,
    },
  });

  const loadCategories = async (type: "receivable" | "payable") => {
    try {
      const categoriesData = await financialService.getCategories(type);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  useEffect(() => {
    loadCategories(selectedType);
  }, [selectedType]);

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as keyof TransactionFormData, value);
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: TransactionFormData) => {
    // Format the data before submitting
    const formattedData = {
      ...data,
      status: 'pending', // Add default status for new transactions
      amount: Number(data.amount),
      due_date: format(data.due_date, 'yyyy-MM-dd'),
      // Convert optional string IDs to numbers if they exist
      person_id: data.person_id ? Number(data.person_id) : undefined,
      contract_id: data.contract_id ? Number(data.contract_id) : undefined,
      bank_account_id: data.bank_account_id ? Number(data.bank_account_id) : undefined,
      payment_type_id: data.payment_type_id ? Number(data.payment_type_id) : undefined,
    };
    onSubmit(formattedData);
  };

  const handleCreateCategory = async (data: { name: string; type: "receivable" | "payable" }) => {
    try {
      await financialService.createCategory(data);
      loadCategories(selectedType);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Transação</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedType(value as "receivable" | "payable");
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="receivable">A Receber</SelectItem>
                    <SelectItem value="payable">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a descrição" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite observações adicionais"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>

      <CategoryForm
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        onSubmit={handleCreateCategory}
        defaultType={selectedType}
      />
    </>
  );
} 