import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function CreatePost() {
  const [formData, setFormData] = useState({
    type: "HAVE" as "HAVE" | "NEED",
    item_name: "",
    category: "food" as
      | "food"
      | "water"
      | "medical"
      | "baby"
      | "power"
      | "other",
    quantity: "",
    area: "Gaza City" as
      | "North Gaza"
      | "Gaza City"
      | "Deir Al-Balah"
      | "Khan Younis"
      | "Rafah",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.item_name || !formData.quantity) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      await api.post("/posts", formData);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "فشل إنشاء المنشور");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "food", label: "طعام" },
    { value: "water", label: "مياه" },
    { value: "medical", label: "طبي" },
    { value: "baby", label: "أطفال" },
    { value: "power", label: "طاقة" },
    { value: "other", label: "أخرى" },
  ];

  const areas = [
    { value: "North Gaza", label: "شمال غزة" },
    { value: "Gaza City", label: "مدينة غزة" },
    { value: "Deir Al-Balah", label: "دير البلح" },
    { value: "Khan Younis", label: "خان يونس" },
    { value: "Rafah", label: "رفح" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        إنشاء منشور جديد
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-field">نوع المنشور</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "HAVE" })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === "HAVE"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-medium">لدي</div>
                <div className="text-sm text-gray-600">
                  أمتلك هذا العنصر وأريد المساعدة
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "NEED" })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === "NEED"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-medium">أحتاج</div>
                <div className="text-sm text-gray-600">أحتاج هذا العنصر</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="item_name" className="label-field">
              اسم العنصر *
            </label>
            <input
              type="text"
              id="item_name"
              required
              className="input-field"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              placeholder="مثال: أرز، حليب، أدوية"
            />
          </div>

          <div>
            <label htmlFor="category" className="label-field">
              الفئة *
            </label>
            <select
              id="category"
              required
              className="input-field"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="label-field">
              الكمية *
            </label>
            <input
              type="text"
              id="quantity"
              required
              className="input-field"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="مثال: 5 كيلو، 10 عبوات، 2 علبة"
            />
          </div>

          <div>
            <label htmlFor="area" className="label-field">
              المنطقة *
            </label>
            <select
              id="area"
              required
              className="input-field"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value as any })
              }
            >
              {areas.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="label-field">
              وصف إضافي (اختياري)
            </label>
            <textarea
              id="description"
              rows={4}
              className="input-field"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="معلومات إضافية عن العنصر أو كيفية التواصل"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-reverse space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "جاري إنشاء المنشور..." : "نشر المنشور"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary flex-1"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
