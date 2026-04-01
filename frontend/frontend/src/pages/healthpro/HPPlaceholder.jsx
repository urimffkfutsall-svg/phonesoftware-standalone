import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Construction } from 'lucide-react';

const HPPlaceholder = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400">{description}</p>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="py-16 text-center">
          <Construction className="w-16 h-16 mx-auto text-[#00a79d] mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Në Zhvillim</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Ky modul është ende në zhvillim dhe do të jetë i disponueshëm së shpejti.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const HPSettings = () => <HPPlaceholder title="Cilësimet" description="Konfiguroni aplikacionin" />;
