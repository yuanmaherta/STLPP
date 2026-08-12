// ====================================================================
// STLPP - DEFAULT FORM TEMPLATE DATA (v1.0)
// Extracted from legacy evaluation criteria (Form A1, A2, B1, B2)
// ====================================================================

import { FormTemplateStructure } from '@/types';

export const DEFAULT_FORM_STRUCTURE: FormTemplateStructure = {
  formA1: [
    {
      group: 'Behavior/ Sikap Perilaku',
      no: 1,
      items: [
        { id: 'a1-1-1', no: '1.1', label: 'Bertanggung jawab atas tugas, keputusan dan Tindakan yang dilakukan' },
        { id: 'a1-1-2', no: '1.2', label: 'Memiliki keinginan untuk meningkatkan kompetensi diri' },
        { id: 'a1-1-3', no: '1.3', label: 'Membantu karyawan lainnya yang membutuhkan bantuannya' },
        { id: 'a1-1-4', no: '1.4', label: 'Menjaga nama baik sesama karyawan, pimpinan, BUMN dan Negara' },
        { id: 'a1-1-5', no: '1.5', label: 'Dapat menyesuaikan diri di lingkungan kerja dengan cepat' },
        { id: 'a1-1-6', no: '1.6', label: 'Membuka diri untuk bekerjasama dengan orang lain agar menghasilkan pekerjaan yang lebih baik' },
      ],
    },
    {
      group: 'Core Kompetensi/ Kompetensi Inti',
      no: 2,
      subgroups: [
        {
          label: 'Achievement Orientation (ACH)',
          items: [
            { id: 'a1-2-1', no: '2.1', label: 'Memperbaiki masalah pelayanan dan mengambil tanggung jawab untuk menyelesaikan masalah yang muncul terkait dengan kepentingan pelanggan' },
            { id: 'a1-2-2', no: '2.2', label: 'Mampu mengatasi masalah secara cepat dan tidak bersikap defensif' },
          ],
        },
        {
          label: 'Customer Service Orientation (CSO)',
          items: [
            { id: 'a1-2-3', no: '2.3', label: 'Membuat perubahan spesifik dalam sistem atau metode kerja sendiri untuk meningkatkan kinerja' },
            { id: 'a1-2-4', no: '2.4', label: 'Bekerja dengan lebih efisien, lebih cepat, dengan biaya yang lebih rendah' },
            { id: 'a1-2-5', no: '2.5', label: 'Meningkatkan kualitas, kepuasan klien, moral, pendapatan tanpa harus menetapkan target yang spesifik' },
          ],
        },
        {
          label: 'Integrity (ING)',
          items: [
            { id: 'a1-2-6', no: '2.6', label: 'Melakukan Tindakan yang Konsisten dengan Nilai-Nilai dan Keyakinan' },
            { id: 'a1-2-7', no: '2.7', label: 'Menghindari orang-orang atau situasi yang dapat mempengaruhi konsistensi terhadap nilai-nilai yang diyakininya; memperlakukan semua orang dengan adil (equal)' },
          ],
        },
        {
          label: 'Teamwork (TW)',
          items: [
            { id: 'a1-2-8', no: '2.8', label: 'Mampu mengungkapkan harapan dan berbicara positif dengan anggota kelompok atau pihak lain diluar kelompok' },
            { id: 'a1-2-9', no: '2.9', label: 'Mampu menghargai kecerdasan, keahlian dan kontribusi anggota kelompok secara jelas' },
          ],
        },
      ],
    },
    {
      group: 'Capacity/ Kapasitas Karyawan',
      no: 3,
      items: [
        { id: 'a1-3-1', no: '3.1', label: 'Pengetahuan dan Kemampuan Teknis bidang tugasnya' },
        { id: 'a1-3-2', no: '3.2', label: 'Kemampuan atas pemahaman dan implementasi Sistem dan Prosedur' },
        { id: 'a1-3-3', no: '3.3', label: 'Menciptakan kondisi yang memungkinkan kelompok untuk berkinerja terbaik' },
        { id: 'a1-3-4', no: '3.4', label: 'Setiap tugas yang diberikan dapat diselesaikan dengan baik sesuai dengan waktu yang diberikan' },
        { id: 'a1-3-5', no: '3.5', label: 'Menyusun prioritas pekerjaan sesuai dengan strategi dan sasaran bisnis' },
        { id: 'a1-3-6', no: '3.6', label: 'Mengatur pekerjaan dengan efektif' },
        { id: 'a1-3-7', no: '3.7', label: 'Kemampuan Berkomunikasi' },
        { id: 'a1-3-8', no: '3.8', label: 'Hubungan Interpersonal' },
      ],
    },
    {
      group: 'Process/ Proses Kerja',
      no: 4,
      items: [
        { id: 'a1-4-1', no: '4.1', label: 'Mampu menterjemahkan dan mengimplementasikan ide atau gagasan terkait perbaikan bidang kerjanya' },
        { id: 'a1-4-2', no: '4.2', label: 'Mampu menyelesaikan keragaman permasalahan terkait bidang kerjanya' },
        { id: 'a1-4-3', no: '4.3', label: 'Menyelesaikan masalah menggunakan lebih dari satu cara atau alternatif pilihan' },
        { id: 'a1-4-4', no: '4.4', label: 'Mampu menganalisa sebuah permasalahan serta membuat keputusan berdasarkan hasil analisa cost-benefit' },
      ],
    },
  ],
  formA2: [
    {
      group: 'Learning Agility',
      no: 1,
      items: [
        { id: 'a2-1-1', no: '1.1', label: 'Kemampuan untuk menganalisa permasalahan dengan cara-cara yang tidak biasa' },
        { id: 'a2-1-2', no: '1.2', label: 'Seorang komunikator handal yang dapat bekerja baik dengan berbagai macam orang dari latar belakang yang berbeda-beda' },
        { id: 'a2-1-3', no: '1.3', label: 'Senang bereksperimen akan hal-hal baru, serta nyaman dengan perubahan-perubahan yang terjadi disekitarnya' },
        { id: 'a2-1-4', no: '1.4', label: 'Senantiasa mampu memberikan hasil (delivering result) di awal ketika terjadinya masa-masa yang sulit' },
        { id: 'a2-1-5', no: '1.5', label: 'Pengetahuan yang mendalam mengenai kekuatan dan kelemahan di dalam dirinya' },
      ],
    },
  ],
  formB1: [
    {
      group: 'Penilaian Kinerja',
      items: [
        { id: 'b1-1-1', no: '1.1', label: 'Secara konsisten mampu memenuhi tujuan-tujuan unit kerja dan atau harapan-harapan dari atasannya dalam pekerjaannya sehari-hari.' },
        { id: 'b1-1-2', no: '1.2', label: 'Memiliki standar pencapaian yang baik dari sisi pencapaian pribadi maupun dalam kelompok/unit kerja.' },
        { id: 'b1-1-3', no: '1.3', label: 'Kompetensi teknis yang dimiliki untuk menjalankan pekerjaannya sehari-hari.' },
      ],
    },
  ],
  formB2: [
    {
      group: 'AKHLAK',
      items: [
        { id: 'b2-2-1', no: '2.1', label: 'Berperilaku & bertindak selaras dengan perkataan' },
        { id: 'b2-2-2', no: '2.2', label: 'Menjadi seseorang yang dapat dipercaya & bertanggungjawab' },
        { id: 'b2-2-3', no: '2.3', label: 'Bertindak jujur & berpegang teguh pada nilai moral & etika secara konsisten' },
        { id: 'b2-2-4', no: '2.4', label: 'Terus menerus meningkatkan kemampuan/kompetensi agar selalu mutakhir' },
        { id: 'b2-2-5', no: '2.5', label: 'Selalu dapat diandalkan dengan memberikan kinerja terbaik' },
        { id: 'b2-2-6', no: '2.6', label: 'Menghasilkan kinerja & prestasi yang memuaskan' },
        { id: 'b2-2-7', no: '2.7', label: 'Berperilaku saling membantu & mendukung sesama insan organisasi maupun masyarakat' },
        { id: 'b2-2-8', no: '2.8', label: 'Selalu menghargai pendapat, ide atau gagasan orang lain' },
        { id: 'b2-2-9', no: '2.9', label: 'Menghargai kontribusi setiap orang dari berbagai latar belakang' },
        { id: 'b2-2-10', no: '2.10', label: 'Menunjukkan komitmen yang kuat untuk mencapai suatu tujuan' },
        { id: 'b2-2-11', no: '2.11', label: 'Bersedia berkontribusi lebih dan rela berkorban dalam mencapai suatu tujuan' },
        { id: 'b2-2-12', no: '2.12', label: 'Menunjukkan kepatuhan kepada Unit Kerja, Perusahaan dan negara' },
        { id: 'b2-2-13', no: '2.13', label: 'Melakukan inovasi secara konsisten untuk menghasilkan yang lebih baik' },
        { id: 'b2-2-14', no: '2.14', label: 'Terbuka terhadap perubahan, bergerak lincah, cepat dan aktif dalam setiap perubahan untuk menjadi lebih baik' },
        { id: 'b2-2-15', no: '2.15', label: 'Bertindak proaktif dalam menggerakkan perubahan' },
        { id: 'b2-2-16', no: '2.16', label: 'Terbuka bekerjasama dengan berbagai pihak' },
        { id: 'b2-2-17', no: '2.17', label: 'Mendorong terjadinya sinergi untuk mendapatkan manfaat dan nilai tambah' },
        { id: 'b2-2-18', no: '2.18', label: 'Bersinergi untuk mencapai tujuan bersama' },
      ],
    },
  ],
};

// Helper function to extract flat list of all item IDs in Form A and Form B
export function getAllFormItemIds(structure: FormTemplateStructure) {
  const extractGroupItemIds = (groups: typeof structure.formA1) => {
    const ids: string[] = [];
    groups.forEach((g) => {
      if (g.items) g.items.forEach((item) => ids.push(item.id));
      if (g.subgroups) g.subgroups.forEach((sg) => sg.items.forEach((item) => ids.push(item.id)));
    });
    return ids;
  };

  const formAItemIds = [
    ...extractGroupItemIds(structure.formA1),
    ...extractGroupItemIds(structure.formA2),
  ];

  const formBItemIds = [
    ...extractGroupItemIds(structure.formB1),
    ...extractGroupItemIds(structure.formB2),
  ];

  return { formAItemIds, formBItemIds };
}
